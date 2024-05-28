import asyncio
import requests
from bleak import BleakClient, BleakError

addresses = ["ab:3b:00:23:de:c5", "ab:3b:00:23:de:dc"]  # Add more as needed
queue = asyncio.Queue()
tasks = []  # Track tasks
employee_ids = set()  # Store employee IDs

class ScannerState:
    def __init__(self):
        self.current_user = None
        self.prev_barcode = ""  # To store previous barcode

def fetch_employee_ids():
    url = "http://192.168.1.176:3001/getIDs"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        return {item["EMPLOYEE_ID"] for item in data["data"]}
    except requests.RequestException as e:
        return set()

def is_employee_id(segment):
    return segment in employee_ids

def notification_handler(state):
    def handler(sender, data):
        try:
            barcode = data.decode('utf-8')
            formatted_barcode = barcode.strip().replace("\x00", "")

            if len(formatted_barcode) == 6 and is_employee_id(formatted_barcode):
                state.current_user = formatted_barcode
                return
            
            if len(formatted_barcode) == 17:
                if state.current_user is not None:
                    state.prev_barcode = ""
                    asyncio.create_task(queue.put((formatted_barcode, state.current_user)))
                
            if len(formatted_barcode) > 17:
                if state.current_user is not None:
                    if state.prev_barcode:
                        combined_barcode = formatted_barcode + state.prev_barcode
                        asyncio.create_task(queue.put((combined_barcode, state.current_user)))
                        state.prev_barcode = ""
                    else:
                        state.prev_barcode = formatted_barcode
                        asyncio.create_task(queue.put((formatted_barcode, state.current_user)))
                else:
                    state.prev_barcode = ""
            
            elif len(formatted_barcode) < 17:
                if state.prev_barcode:
                    combined_barcode = state.prev_barcode + formatted_barcode
                    if state.current_user is not None:
                        asyncio.create_task(queue.put((combined_barcode, state.current_user)))
                        state.prev_barcode = ""
                    else:
                        state.prev_barcode = ""
                else:
                    combined_barcode = state.prev_barcode + formatted_barcode
                    asyncio.create_task(queue.put((combined_barcode, state.current_user)))
                    state.prev_barcode = formatted_barcode

        except UnicodeDecodeError:
            raw_data = data.hex()
            asyncio.create_task(queue.put((f"RAW DATA: {raw_data}", None)))
    return handler

async def send_status(scanner_id, status):
    url = "http://192.168.1.176:3001/setScanner"
    data = {"id": scanner_id, "status": status}
    try:
        await asyncio.to_thread(requests.post, url, json=data)
    except requests.RequestException as e:
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

    except BleakError as e:
        pass
    except Exception as e:
        pass

    finally:
        if client.is_connected:
            try:
                await client.stop_notify('00002af0-0000-1000-8000-00805f9b34fb')
                await client.disconnect()
            except Exception as e:
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
    try:
        response = requests.post(url, json=data)
        response.raise_for_status()  # Raise an exception for HTTP errors
    except requests.RequestException as e:
        pass

async def process_queue():
    while True:
        barcode, user_id = await queue.get()
        data = {"barcode": barcode, "employee": user_id}
        try:
            await asyncio.to_thread(send_request, data)
        except Exception as e:
            pass  # Log error if needed
        finally:
            queue.task_done()  # Ensure queue moves to the next item

async def main():
    global queue, tasks, employee_ids
    employee_ids = fetch_employee_ids()  # Fetch employee IDs at startup
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
