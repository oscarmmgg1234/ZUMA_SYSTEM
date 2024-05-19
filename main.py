import asyncio
from bleak import BleakClient, BleakError

addresses = ["ab:3b:00:23:de:c5", "xx:xx:xx:xx:xx:xx"]  # Add more as needed
queue = asyncio.Queue()

class ScannerState:
    def __init__(self):
        self.current_user = None

def notification_handler(state):
    def handler(sender, data):
        """Handler for processing incoming notification data."""
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
            print(f"Connecting to {address}")
            await client.connect()
            print(f"Connected to {address}")
            await client.start_notify('00002af0-0000-1000-8000-00805f9b34fb', notification_handler(state))

            while client.is_connected:
                await asyncio.sleep(4)  # Maintain connection checks every second

        except BleakError as e:
            print(f"BleakError with scanner {address}: {e}")
        except Exception as e:
            print(f"Error with scanner {address}: {e}")
        finally:
            if client.is_connected:
                await client.stop_notify('00002af0-0000-1000-8000-00805f9b34fb')
                await client.disconnect()
            print(f"Disconnected from {address}")

        print(f"Reconnecting to {address} in 5 seconds")
        await asyncio.sleep(5)

async def maintain_connection(address):
    state = ScannerState()  # Create a new state for each scanner
    while True:
        await connect_and_listen(address, state)

async def process_queue():
    while True:
        barcode, user_id = await queue.get()
        print(f"Processed barcode: {barcode}")
        print(f"User ID: {user_id}")
        queue.task_done()

async def main():
    # Create queue and all tasks within the same event loop context
    global queue
    queue = asyncio.Queue()

    # Start a task for processing the queue
    processor = asyncio.create_task(process_queue())

    # Start tasks for each scanner
    scanner_tasks = [asyncio.create_task(maintain_connection(address)) for address in addresses]

    # Wait for all tasks to complete (they won't under normal operation)
    await asyncio.gather(processor, *scanner_tasks, return_exceptions=True)

# Run the main function
if __name__ == "__main__":
    asyncio.run(main())
