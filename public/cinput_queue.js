class ClientInputQueue {
  constructor() {
    this.EnqueClientInput = EnqueClientInput;
    this.DequeClientInput = DequeClientInput;
    this.IsEmpty = IsEmpty;
    this.ForEach = ForEach;
    this.Count = () => { return cinputque.length; };

    /*
     *  input
     *  {
     *    room,
     *    player,
     *    type,
     *    seqnum
     *  }
    */
    let cinputque = [];

    function ForEach(func) {
      for (const key in cinputque) {
        if (func(key, cinputque[key]) === null)
          break;
      }
    }

    function EnqueClientInput(input) {
      cinputque.push(input);
    }

    function DequeClientInput() {
      if (IsEmpty())
        return null;

      let ret = cinputque[0];
      cinputque.splice(0, 1);
      return ret;
    }

    function IsEmpty() {
      return (cinputque.length === 0);
    }
  }
}

ClientInputQueue.instance = null;
ClientInputQueue.GetInstance = () => {
  if (ClientInputQueue.instance === null) {
    ClientInputQueue.instance = new ClientInputQueue();
  }

  return ClientInputQueue.instance;
};

if (typeof module !== 'undefined') {
  module.exports = ClientInputQueue.GetInstance();
}
