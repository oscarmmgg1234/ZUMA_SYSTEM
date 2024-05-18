import asyncio
from bleak import BleakClient

addresses = ["ab:3b:00:23:de:c5", "xx:xx:xx:xx:xx:xx"]  # Add more as needed
queue = asyncio.Queue()

def notification_handler(sender, data):
    """Handler for processing incoming notification data."""
    try:
        barcode = data.decode('utf-8')
        print(f"Received decoded data from {sender}: {barcode}")
        asyncio.create_task(queue.put(barcode))
    except UnicodeDecodeError:
        raw_data = data.hex()
        print(f"Received raw data from {sender}: {raw_data}")
        asyncio.create_task(queue.put(f"RAW DATA: {raw_data}"))

async def connect_and_listen(address):
    client = BleakClient(address)
    try:
        await client.connect()
        print(f"Connected to {address}")
        await client.start_notify('00002af0-0000-1000-8000-00805f9b34fb', notification_handler)
        while client.is_connected:
            await asyncio.sleep(1)  # Maintain connection checks every second
    except Exception as e:
        print(f"An error occurred with {address}: {e}")
    finally:
        if client.is_connected:
            await client.stop_notify('00002af0-0000-1000-8000-00805f9b34fb')
            await client.disconnect()
        print(f"Disconnected cleanly from {address}.")

async def maintain_connection(address):
    while True:
        print(f"Trying to connect to {address}")
        await connect_and_listen(address)
        print(f"Disconnected from {address}, attempting to reconnect...")
        await asyncio.sleep(1)  # Delay before trying to reconnect to this scanner only

async def process_queue():
    while True:
        barcode = await queue.get()
        print(f"Processing barcode: {barcode}")
        queue.task_done()
        await asyncio.sleep(2) 

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
