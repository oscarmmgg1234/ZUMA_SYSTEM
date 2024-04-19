class Node {
  constructor(data) {
    this.payload = data;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.current = null; // Start with current as null
    this.size = 0;
  }

  append(data) {
    this.size++;
    let newNode = new Node(data);
    if (!this.head) {
      this.head = newNode;
      this.current = newNode; // Initialize current when the first node is added
    } else {
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = newNode;
    }
  }

  // Move to the next node in the list and return true if there is a next node
  next() {
    if (this.current && this.current.next) {
      this.current = this.current.next;
      return true;
    }
    return false; // Return false if there is no next node
  }

  // Return the data at the current node
  getData() {
    return this.current ? this.current.payload : undefined;
  }

  // Reset the current pointer to the start of the list
  reset() {
    this.current = this.head;
  }

  // Checks if the current node is the last one
  isEnd() {
    return this.current && !this.current.next;
  }
}

exports.LinkedList = LinkedList;
