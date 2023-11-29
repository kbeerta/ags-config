
import Service from 'resource:///com/github/Aylur/ags/service.js';
import { exec, execAsync } from 'resource:///com/github/Aylur/ags/utils.js';

class BrightnessService extends Service {
  static {
    Service.register(
      this,
      {
        'brightness-changed': ['float'],
      },
      {
        'value': ['float', 'rw'],
      },
    );
  }

  constructor() {
    super();
    const current = Number(exec('light'));
    const max = Number(exec('light -M'))
    this._value = current / max;
  }

  _value = 0;

  get value() { return this._value; }

  set value(percent) {
    if (percent < 0) percent = 0;
    if (percent > 1) percent = 1;

    execAsync(`light -S ${percent * 100}`)
      .then(() => {
        this._value = percent;
        this.changed('value');
      }).catch(print)
  }
}

const service = new BrightnessService();
globalThis.brightness = service;
export default service;
