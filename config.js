
import App from 'resource:///com/github/Aylur/ags/app.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';

import Audio from 'resource:///com/github/Aylur/ags/service/audio.js';
import Battery from 'resource:///com/github/Aylur/ags/service/battery.js';
import Hyprland from 'resource:///com/github/Aylur/ags/service/hyprland.js';
import Network from 'resource:///com/github/Aylur/ags/service/network.js';

import BrightnessService from './services/brightness.js';

import { exec, execAsync, timeout } from 'resource:///com/github/Aylur/ags/utils.js';

function formatPrepending(n) {
  return n.toLocaleString(undefined, { minimumIntegerDigits: 2 });
}

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

const InfoRevealer = () => {
  let open = false;

  const duration = 350;

  const indicator = Indicator('');

  const batteryRevealer = Widget.Revealer({
    transition: 'slide_right',
    transition_duration: duration,
    child: BatteryLabel(),
  });

  const revealer = Widget.Revealer({
    transition: 'slide_left',
    transition_duration: duration,
    child: SystemInfo(),
  });

  return Widget.Box({
    spacing: 5,
    children: [
      Widget.EventBox({
        onPrimaryClick: () => {
          open = !open;
          revealer.reveal_child = open;
          batteryRevealer.reveal_child = open;
          indicator.label = open ? '' : '';
        },
        child: Widget.Box({
          children: [
            revealer,
            indicator,
          ],
        }),
      }),
      BatteryIcon(),
      batteryRevealer,
    ],
  });
}

const SystemInfo = () => Widget.Box({
  className: 'sysinfo',
  children: [
    Brightness(),
    Separator('•'),
    Volume(),
  ],
});

const Temp = () => Widget.Box({
  className: 'temp',
  spacing: 5,
  children: [
    Widget.Label(''),
    Widget.Label({
      connections: [
        [1000, self => execAsync(['cat', '/sys/class/thermal/thermal_zone6/temp'])
          .then(temp => self.label = `${temp / 1000}°C`).catch(console.error)],
      ],
    }),
  ],
});

const Brightness = () => Widget.Box({
  className: 'brightness',
  spacing: 5,
  children: [
    Widget.Label(''),
    Widget.Label({
      connections: [
        [50, self => execAsync(['light'])
          .then(brightness => self.label = `${formatPrepending(Math.floor(brightness))}%`).catch(console.error)],
      ],
    }),
  ],
});

const Volume = () => Widget.Box({
  className: 'volume',
  spacing: 5,
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
          self.label = `${formatPrepending(Math.floor(Audio.speaker?.volume * 100) || 0)}%`;
        }, 'speaker-changed'],
      ],
    }),
  ],
});

const Clock = () => Widget.Label({
  className: 'clock',
  connections: [
    [1000, self => execAsync(['date', '+%H:%M'])
      .then(date => self.label = date).catch(console.error)],
  ],
});

const BatteryIcon = () => Widget.Label({
  className: 'batteryIcon',
  connections: [[Battery, self => {
    self.label = Battery.percent < 25 ? '󱃍' : Battery.charging ? '󰢟' : '󰂎';
  }]],
  // binds: [
  //   ['label', BatteryService, 'charging', c => c ? '󰢟' : '󰂎'],
  //   ['className', BatteryService, 'percent', p => p < 25 ? 'alert' : ''],
  // ],
});

const BatteryLabel = () => Widget.Box({
  className: 'batteryLabel',
  visible: false,
  children: [
    Widget.Label({
      binds: [
        ['label', Battery, 'percent', p => `${formatPrepending(p > 0 ? p : 0)}%`],
      ],
    }),
  ],
});

const Separator = (separator) => Widget.Label({
  className: 'separator',
  label: separator,
});

const Indicator = (indicator) => Widget.Label({
  className: 'indicator',
  label: indicator,
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
  className: 'right',
  children: [
    InfoRevealer(),
    Separator('|'),
    Clock(),
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
