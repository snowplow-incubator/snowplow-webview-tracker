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

describe('Android interface', () => {
  let windowSpy: any;
  let trackWebViewStub = jest.fn();

  beforeEach(() => {
    windowSpy = jest.spyOn(window, 'window', 'get');
    windowSpy.mockImplementation(() => ({
      location: { href: 'http://test.com' },
      SnowplowWebInterfaceV2: {
        trackWebViewEvent: trackWebViewStub,
      },
    }));
  });

  afterEach(() => {
    windowSpy.mockRestore();
  });

  it('tracks a webview primitive event', () => {
    const atomic = {
      eventName: 'se',
      trackerVersion: 'webview-0.3.0',
      category: 'cat',
      action: 'act',
    };

    trackWebViewEvent(atomic, null, null, ['ns1', 'ns2']);

    expect(trackWebViewStub).toHaveBeenCalledWith(
      JSON.stringify(atomic),
      null,
      null,
      ['ns1', 'ns2']
    );
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

    expect(trackWebViewStub).toHaveBeenCalledWith(
      JSON.stringify(atomic),
      JSON.stringify(event),
      null,
      null
    );
  });

  it('adds context entities', () => {
    const entity = {
      schema: 'iglu:schema',
      data: {
        abc: 1,
      },
    };

    trackWebViewEvent({}, null, [entity], null);

    expect(trackWebViewStub).toHaveBeenCalledWith(
      '{}',
      null,
      JSON.stringify([entity]),
      null
    );
  });
});
