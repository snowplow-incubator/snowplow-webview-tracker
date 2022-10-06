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
} from '../src';

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
