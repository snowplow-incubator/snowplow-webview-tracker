// Copyright (c) 2022 Snowplow Analytics Ltd. All rights reserved.
//
// This program is licensed to you under the Apache License Version 2.0,
// and you may not use this file except in compliance with the Apache License Version 2.0.
// You may obtain a copy of the Apache License Version 2.0 at http://www.apache.org/licenses/LICENSE-2.0.
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the Apache License Version 2.0 is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the Apache License Version 2.0 for the specific language governing permissions and limitations there under.

import {
  trackPageView,
  trackScreenView,
  trackSelfDescribingEvent,
  trackStructEvent,
  trackWebViewEvent,
} from '../src';
import { AtomicProperties } from '../src/api';

describe('React Native interface', () => {
  let windowSpy: any;
  let messageHandler = jest.fn();

  beforeEach(() => {
    windowSpy = jest.spyOn(window, 'window', 'get');
    windowSpy.mockImplementation(() => ({
      location: { href: 'http://test.com' },
      ReactNativeWebView: {
        postMessage: messageHandler,
      },
    }));
  });

  afterEach(() => {
    windowSpy.mockRestore();
  });

  it('track a webview primitive event', () => {
    const atomic: AtomicProperties = {
      eventName: 'pp',
      trackerVersion: 'webview',
      pageUrl: 'http://test.com',
      pingXOffsetMin: 20,
      pingXOffsetMax: 30,
      pingYOffsetMin: 40,
      pingYOffsetMax: 50,
    };

    trackWebViewEvent({ properties: atomic }, ['ns1', 'ns2']);

    expect(messageHandler).toHaveBeenCalledWith(
      JSON.stringify({
        command: 'trackWebViewEvent',
        event: {
          eventName: 'pp',
          trackerVersion: 'webview',
          pageUrl: 'http://test.com',
          pingXOffsetMin: 20,
          pingXOffsetMax: 30,
          pingYOffsetMin: 40,
          pingYOffsetMax: 50,
        },
        trackers: ['ns1', 'ns2'],
      })
    );
  });

  it('tracks a webview self-describing event', () => {
    const atomic: AtomicProperties = {
      eventName: 'ue',
      trackerVersion: 'webview',
    };
    const event = {
      event: {
        schema: 'schema',
        data: {
          abc: 1,
        },
      },
    };

    trackWebViewEvent({ properties: atomic, event: event });

    expect(messageHandler).toHaveBeenCalledWith(
      JSON.stringify({
        command: 'trackWebViewEvent',
        event: {
          selfDescribingEventData: event,
          eventName: 'ue',
          trackerVersion: 'webview',
        },
      })
    );
  });

  it('tracks a webview event with entities', () => {
    const entity = {
      schema: 'iglu:schema',
      data: {
        abc: 1,
      },
    };

    trackWebViewEvent({ properties: {}, context: [entity] });

    expect(messageHandler).toHaveBeenCalledWith(
      JSON.stringify({
        command: 'trackWebViewEvent',
        event: {},
        context: [entity],
        trackers: undefined,
      })
    );
  });

  it('track a structured view', () => {
    trackStructEvent({ category: 'cat', action: 'act' }, ['ns1', 'ns2']);
    expect(messageHandler).toHaveBeenCalledWith(
      JSON.stringify({
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
      })
    );
  });

  it('tracks a screen view', () => {
    trackScreenView({ name: 'sv', id: 'xxx' });

    expect(messageHandler).toHaveBeenCalledWith(
      JSON.stringify({
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
      })
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

    expect(messageHandler).toHaveBeenCalledWith(
      JSON.stringify({
        command: 'trackSelfDescribingEvent',
        event: {
          schema: 'schema',
          data: {
            abc: 1,
          },
        },
        context: undefined,
        trackers: undefined,
      })
    );
  });

  it('tracks a page view', () => {
    Object.defineProperty(global.document, 'title', { value: 'Title' });
    Object.defineProperty(global.document, 'referrer', {
      value: 'http://referrer.com',
    });

    trackPageView();

    expect(messageHandler).toHaveBeenCalledWith(
      JSON.stringify({
        command: 'trackPageView',
        event: {
          url: 'http://test.com',
          title: 'Title',
          referrer: 'http://referrer.com',
        },
        context: undefined,
        trackers: undefined,
      })
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

    expect(messageHandler).toHaveBeenCalledWith(
      JSON.stringify({
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
      })
    );
  });
});
