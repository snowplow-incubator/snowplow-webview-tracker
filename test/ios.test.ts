import {
  trackPageView,
  trackScreenView,
  trackSelfDescribingEvent,
  trackStructEvent,
} from '../src';

describe('iOS interface', () => {
  let windowSpy: any;
  let messageHandler = jest.fn();

  beforeEach(() => {
    windowSpy = jest.spyOn(window, 'window', 'get');
    windowSpy.mockImplementation(() => ({
      location: { href: 'http://test.com' },
      webkit: {
        messageHandlers: {
          snowplow: {
            postMessage: messageHandler,
          },
        },
      },
    }));
  });

  afterEach(() => {
    windowSpy.mockRestore();
  });

  it('track a structured view', () => {
    trackStructEvent({ category: 'cat', action: 'act' }, ['ns1', 'ns2']);
    expect(messageHandler).toHaveBeenCalledWith({
      command: 'trackStructEvent',
      event: {
        category: 'cat',
        action: 'act',
        label: undefined,
        property: undefined,
        value: undefined,
      },
      context: undefined,
      trackers: ['ns1', 'ns2'],
    });
  });

  it('tracks a screen view', () => {
    trackScreenView({ name: 'sv', id: 'xxx' });

    expect(messageHandler).toHaveBeenCalledWith({
      command: 'trackScreenView',
      event: {
        name: 'sv',
        id: 'xxx',
        type: undefined,
        previousName: undefined,
        previousId: undefined,
        previousType: undefined,
        transitionType: undefined,
      },
      context: undefined,
      trackers: undefined,
    });
  });

  it('tracks a self-describing event', () => {
    trackSelfDescribingEvent({
      event: {
        schema: 'schema',
        data: {
          abc: 1,
        },
      },
    });

    expect(messageHandler).toHaveBeenCalledWith({
      command: 'trackSelfDescribingEvent',
      event: {
        schema: 'schema',
        data: {
          abc: 1,
        },
      },
      context: undefined,
      trackers: undefined,
    });
  });

  it('tracks a page view', () => {
    Object.defineProperty(global.document, 'title', { value: 'Title' });
    Object.defineProperty(global.document, 'referrer', {
      value: 'http://referrer.com',
    });

    trackPageView();

    expect(messageHandler).toHaveBeenCalledWith({
      command: 'trackPageView',
      event: {
        url: 'http://test.com',
        title: 'Title',
        referrer: 'http://referrer.com',
      },
      context: undefined,
      trackers: undefined,
    });
  });

  it('adds context entities', () => {
    trackStructEvent(
      {
        category: 'cat',
        action: 'act',
        context: [
          {
            schema: 'schema',
            data: {
              abc: 1,
            },
          },
        ],
      },
      undefined
    );

    expect(messageHandler).toHaveBeenCalledWith({
      command: 'trackStructEvent',
      event: {
        category: 'cat',
        action: 'act',
        label: undefined,
        property: undefined,
        value: undefined,
      },
      context: [
        {
          schema: 'schema',
          data: {
            abc: 1,
          },
        },
      ],
      trackers: undefined,
    });
  });
});
