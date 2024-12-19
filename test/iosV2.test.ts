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

import { trackWebViewEvent } from '../src';

describe('iOS interface', () => {
  let windowSpy: any;
  let messageHandler = jest.fn();

  beforeEach(() => {
    windowSpy = jest.spyOn(window, 'window', 'get');
    windowSpy.mockImplementation(() => ({
      location: { href: 'http://test.com' },
      webkit: {
        messageHandlers: {
          snowplowV2: {
            postMessage: messageHandler,
          },
        },
      },
    }));
  });

  afterEach(() => {
    windowSpy.mockRestore();
  });

  it('tracks a webview primitive event', () => {
    const atomic = {
      eventName: 'pv',
      trackerVersion: 'webview',
      url: 'http://test.com',
      title: 'test title',
    };

    trackWebViewEvent(atomic, null, null, ['ns1', 'ns2']);

    expect(messageHandler).toHaveBeenCalledWith({
      atomicProperties: JSON.stringify(atomic),
      selfDescribingEventData: null,
      entities: null,
      trackers: ['ns1', 'ns2'],
    });
  });

  it('tracks a webview self-describing event', () => {
    const atomic = {
      eventName: 'ue',
      trackerVersion: 'webview-0.3.0',
    };
    const event = {
      event: {
        schema: 'schema',
        data: {
          abc: 1,
        },
      },
    };

    trackWebViewEvent(atomic, event, null, null);

    expect(messageHandler).toHaveBeenCalledWith({
      atomicProperties: JSON.stringify(atomic),
      selfDescribingEventData: JSON.stringify(event),
      entities: null,
      trackers: null,
    });
  });

  it('adds context entities', () => {
    const entity = {
      schema: 'iglu:schema',
      data: {
        abc: 1,
      },
    };

    trackWebViewEvent({}, null, [entity], null);

    expect(messageHandler).toHaveBeenCalledWith({
      atomicProperties: '{}',
      selfDescribingEventData: null,
      entities: JSON.stringify([entity]),
      trackers: null,
    });
  });
});
