import asyncio
from bleak import BleakClient, BleakError

addresses = ["ab:3b:00:23:de:c5"]  # Add more as needed
queue = asyncio.Queue()

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

async def connect_and_listen(address, state):
    while True:
        client = BleakClient(address)
        try:
            await client.connect()
            await client.start_notify('00002af0-0000-1000-8000-00805f9b34fb', notification_handler(state))

            while client.is_connected:
                await asyncio.sleep(4)
        except BleakError:
            pass
        except Exception:
            pass
        finally:
            if client.is_connected:
                await client.stop_notify('00002af0-0000-1000-8000-00805f9b34fb')
                await client.disconnect()

        await asyncio.sleep(5)

async def maintain_connection(address):
    state = ScannerState()
    while True:
        await connect_and_listen(address, state)

async def process_queue():
    while True:
        barcode, user_id = await queue.get()
        queue.task_done()

async def main():
    global queue
    queue = asyncio.Queue()
    processor = asyncio.create_task(process_queue())
    scanner_tasks = [asyncio.create_task(maintain_connection(address)) for address in addresses]
    await asyncio.gather(processor, *scanner_tasks, return_exceptions=True)

if __name__ == "__main__":
    asyncio.run(main())
