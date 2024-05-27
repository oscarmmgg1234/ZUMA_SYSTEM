import asyncio
from bleak import BleakClient, BleakError
import requests

addresses = ["ab:3b:00:23:de:c5", "ab:3b:00:23:de:dc"]  # Add more as needed
queue = asyncio.Queue()
tasks = []  # Track tasks

class ScannerState:
    def __init__(self):
        self.current_user = None

def notification_handler(state):
    def handler(sender, data):
        try:
            barcode = data.decode('utf-8')
            formatted_barcode = barcode.strip().replace("\x00", "")
            if len(formatted_barcode) == 6:
                state.current_user = formatted_barcode
            elif len(formatted_barcode) == 17 and state.current_user is not None:
                user_id = state.current_user
                asyncio.create_task(queue.put((formatted_barcode, user_id)))
        except UnicodeDecodeError:
            raw_data = data.hex()
            asyncio.create_task(queue.put((f"RAW DATA: {raw_data}", None)))
    return handler

async def send_status(scanner_id, status):
    url = "http://192.168.1.176:3001/setScanner"
    data = {"id": scanner_id, "status": status}
    try:
        await asyncio.to_thread(requests.post, url, json=data)
    except requests.RequestException:
        pass

async def connect_and_listen(address, state):
    client = BleakClient(address)
    task = asyncio.current_task()
    tasks.append(task)

    try:
        await client.connect()
        await send_status(address, 1)  # Send connected status
        await client.start_notify('00002af0-0000-1000-8000-00805f9b34fb', notification_handler(state))

        while client.is_connected:
            await asyncio.sleep(4)

    except BleakError:
        pass
    except Exception:
        pass

    finally:
        if client.is_connected:
            try:
                await client.stop_notify('00002af0-0000-1000-8000-00805f9b34fb')
                await client.disconnect()
            except Exception:
                pass
        await send_status(address, 0)  # Send disconnected status

    tasks.remove(task)  # Remove the task from the list after completion

async def maintain_connection(address):
    state = ScannerState()
    while True:
        await connect_and_listen(address, state)
        await asyncio.sleep(5)  # Wait before attempting to reconnect

def send_request(data):
    url = "http://192.168.1.176:3001/product_reduction"
    response = requests.post(url, json=data)
    response.raise_for_status()  # Raise an exception for HTTP errors
    return response

async def process_queue():
    while True:
        barcode, user_id = await queue.get()
        data = {"barcode": barcode, "employee": user_id}
        try:
            await asyncio.to_thread(send_request, data)
        except Exception:
            pass
        queue.task_done()

async def main():
    global queue, tasks
    queue = asyncio.Queue()
    processor = asyncio.create_task(process_queue())
    tasks.append(processor)
    scanner_tasks = [asyncio.create_task(maintain_connection(address)) for address in addresses]
    tasks.extend(scanner_tasks)
    await asyncio.gather(processor, *scanner_tasks, return_exceptions=True)

async def shutdown():
    global tasks
    for task in tasks:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        asyncio.run(shutdown())
