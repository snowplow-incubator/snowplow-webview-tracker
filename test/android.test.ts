import {
  trackPageView,
  trackScreenView,
  trackSelfDescribingEvent,
  trackStructEvent,
} from '../src';

describe('Android interface', () => {
  let windowSpy: any;
  let trackStructEventStub = jest.fn();
  let trackScreenViewStub = jest.fn();
  let trackPageViewStub = jest.fn();
  let trackSelfDescribingStub = jest.fn();

  beforeEach(() => {
    windowSpy = jest.spyOn(window, 'window', 'get');
    windowSpy.mockImplementation(() => ({
      location: { href: 'http://test.com' },
      SnowplowWebInterface: {
        trackStructEvent: trackStructEventStub,
        trackScreenView: trackScreenViewStub,
        trackSelfDescribingEvent: trackSelfDescribingStub,
        trackPageView: trackPageViewStub,
      },
    }));
  });

  afterEach(() => {
    windowSpy.mockRestore();
  });

  it('track a structured view', () => {
    trackStructEvent({ category: 'cat', action: 'act' }, ['ns1', 'ns2']);
    expect(trackStructEventStub).toHaveBeenCalledWith(
      'cat',
      'act',
      undefined,
      undefined,
      undefined,
      undefined,
      ['ns1', 'ns2']
    );
  });

  it('tracks a screen view', () => {
    trackScreenView({ name: 'sv', id: 'xxx' });
    expect(trackScreenViewStub).toHaveBeenCalledWith(
      'sv',
      'xxx',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    );
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

    expect(trackSelfDescribingStub).toHaveBeenCalledWith(
      'schema',
      '{"abc":1}',
      undefined,
      undefined
    );
  });

  it('tracks a page view', () => {
    Object.defineProperty(global.document, 'title', { value: 'Title' });
    Object.defineProperty(global.document, 'referrer', {
      value: 'http://referrer.com',
    });

    trackPageView();
    expect(trackPageViewStub).toHaveBeenCalledWith(
      'http://test.com',
      'Title',
      'http://referrer.com',
      undefined,
      undefined
    );
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

    expect(trackStructEventStub).toHaveBeenCalledWith(
      'cat',
      'act',
      undefined,
      undefined,
      undefined,
      '[{"schema":"schema","data":{"abc":1}}]',
      undefined
    );
  });
});
