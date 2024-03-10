# React Geiger

<img src="./logo.png" height="100">

React Geiger is a tool for "audiolizing" React performance issues. You can have it running in the background and makes little clicks which will point your attention to excessive (slow) component rerenders.

Play with it in this [playground](https://playcode.io/1793073)

## Installation

```bash
npm i react-geiger
```

## Usage

You wrap whatever you want to track in the `<Geiger>` component, and re-renders inside will cause a click if they take longer than the threshold set (default: 50ms).

The most basic setup is wrapping your entire app:

```tsx
<Geiger>
  <App />
</Geiger>
```

You can also use it on a sub-tree wherever.

The options are:

```tsx
  profilerId?: string;
  renderTimeThreshold?: number;
  phaseOption?: PhaseOption;
  enabled?: boolean;
```

- `profilerId` is an id that will be passed on to the `React.Profiler` component. You probably don't need to change this.
- `renderTimeThreshold` is the time in milliseconds that will trigger a click. Default is 50ms. Set to 0 to make any re-render click
- `phaseOption` is the phase of the render you want to track, either `'mount'`, `'update'` or `'both'` (which is the default)
- `enabled` defaults to true, but you can use this to disable it. Note that it relies on `React.Profiler` under the hood, which is disabled in production builds per default.

![Not Great, Not Terrible](./not-great-not-terrible.jpg)
