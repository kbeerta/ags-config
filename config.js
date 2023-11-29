
import App from 'resource:///com/github/Aylur/ags/app.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';

import Audio from 'resource:///com/github/Aylur/ags/service/audio.js';
import BatteryService from 'resource:///com/github/Aylur/ags/service/battery.js';
import Hyprland from 'resource:///com/github/Aylur/ags/service/hyprland.js';
import Network from 'resource:///com/github/Aylur/ags/service/network.js';

import BrightnessService from './services/brightness.js';

import { exec, execAsync } from 'resource:///com/github/Aylur/ags/utils.js';

const Workspaces = () => Widget.Box({
  className: 'workspaces',
  connections: [[Hyprland.active.workspace, self => {
    const arr = Array.from({ length: 5 }, (_, i) => i + 1);
    self.children = arr.map(i => Widget.Button({
      onClicked: () => execAsync(`hyprctl dispatch workspace ${i}`),
      child: Widget.Label(`${i}`),
      className: Hyprland.active.workspace.id == i ? 'focused' : '',
    }));
  }]],
});

const SystemInfo = () => Widget.Box({
  className: 'sysinfo',
  children: [
    Temp(),
    Separator(),
    Brightness(),
    Separator(),
    Volume(),
    Separator(),
    Clock(),
    Separator(),
    Battery(),
  ],
});

const Temp = () => Widget.Label({
  className: 'temp',
  connections: [
    [1000, self => execAsync(['cat', '/sys/class/thermal/thermal_zone6/temp'])
      .then(temp => self.label = `${temp / 1000}°C`).catch(console.error)],
  ],
});

const Brightness = () => Widget.Box({
  className: 'brightness',
  spacing: 4,
  children: [
    Widget.Label(''),
    Widget.Label({
      connections: [
        [50, self => execAsync(['light'])
          .then(brightness => self.label = `${Math.floor(brightness)}`).catch(console.error)],
      ],
    }),
  ],
});

// const Brightness = () => Widget.Label({
//   className: 'brightness',
//   connections: [
//     [50, self => execAsync(['light'])
//       .then(brightness => self.label = `${Math.floor(brightness)}`).catch(console.error)],
//   ],
// });

const Volume = () => Widget.Box({
  className: 'volume',
  spacing: 4,
  children: [
    Widget.Label({
      connections: [
        [Audio, self => {
          self.label = `${!Audio.speaker?.stream.isMuted ? '' : '' }`;
        }, 'speaker-changed'],
      ],
    }),
    Widget.Label({
      connections: [
        [Audio, self => {
          self.label = `${Math.floor(Audio.speaker?.volume * 100) || 0 }`;
        }, 'speaker-changed'],
      ],
    }),
  ],
});

// const Volume = () => Widget.Label({
//   className: 'volume',
//   connections: [
//     [Audio, self => {
//       self.label = `${!Audio.speaker?.stream.isMuted ? Math.floor(Audio.speaker?.volume * 100) || 0 : 0 }`;
//     }, 'speaker-changed'],
//   ],
// });

const Clock = () => Widget.Label({
  className: 'clock',
  connections: [
    [1000, self => execAsync(['date', '+%H:%M'])
      .then(date => self.label = date).catch(console.error)],
  ],
});

const Battery = () => Widget.Box({
  className: 'battery',
  spacing: 2,
  children: [
    Widget.Label({
      binds: [
        ['label', BatteryService, 'charching', c => c ? '󰢟' : '󰂎'],
      ],
    }),
    Widget.Label({
      binds: [
        ['label', BatteryService, 'percent', p => `${p > 0 ? p : 0}%`],
      ],
    }),
  ],
});

// const Battery = () => Widget.Label({
//   className: 'battery',
//   binds: [
//     ['label', BatteryService, 'percent', p => `${p > 0 ? p : 0}%`],
//     ['className', BatteryService, 'charching', c => c ? 'charging' : ''],
//   ]
// });

const Separator = () => Widget.Label({
  className: 'separator',
  label: '|',
});

const Left = Widget.Box({
  children: [
    Workspaces(),
  ],
});

const Center = Widget.Box({
  children: [],
});

const Right = Widget.Box({
  hpack: 'end',
  children: [
    SystemInfo(),
  ],
});

const Bar = Widget.Window({
  name: 'bar',
  anchor: ['top', 'left', 'right'],
  exclusivity: 'exclusive',
  margins: [10, 10, 0],
  child: Widget.CenterBox({
    startWidget: Left,
    centerWidget: Center,
    endWidget: Right,
  }),
})

export default {
  style: App.configDir + '/style.css',
  windows: [
    Bar,
  ],
};
