class Queue {
  constructor() {
    this.Enque = Enque;
    this.Deque = Deque;
    this.Remove = Remove;
    this.IsEmpty = IsEmpty;
    this.ForEach = ForEach;
    this.Count = () => { return m_queue.length; };
    this.Front = () => {
      if (this.IsEmpty())
        return null;
      return m_queue[0];
    };

    this.Back = () => {
      if (this.IsEmpty() || this.Count() === 0)
        return null;
      return m_queue[this.Count() - 1];
    };
    this.Value = (idx) => {
      if (idx < 0)
        return null;
      else if (idx >= this.Count())
        return null;

      return m_queue[idx];
    };

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

    function Remove(count) {
      if (count < 1 || count > this.Count())
        return false;

      m_queue.splice(0, count);
      return true;
    }

    function IsEmpty() {
      return (m_queue.length === 0);
    }
  }
}

if (typeof module !== 'undefined') {
  module.exports = Queue;
}
