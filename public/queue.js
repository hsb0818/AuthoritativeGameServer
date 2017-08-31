class Queue {
  constructor() {
    this.Enque = Enque;
    this.Deque = Deque;
    this.IsEmpty = IsEmpty;
    this.ForEach = ForEach;
    this.Count = () => { return m_queue.length; };

    /*
     *
     *  {
     *    room,
     *    player,
     *    type,
     *    seqnum
     *  }
    */
    let m_queue = [];

    function ForEach(func) {
      for (const key in m_queue) {
        if (func(key, m_queue[key]) === null)
          break;
      }
    }

    function Enque(input) {
      m_queue.push(input);
    }

    function Deque() {
      if (IsEmpty())
        return null;

      let ret = m_queue[0];
      m_queue.splice(0, 1);
      return ret;
    }

    function IsEmpty() {
      return (m_queue.length === 0);
    }
  }
}

if (typeof module !== 'undefined') {
  module.exports = Queue;
}
