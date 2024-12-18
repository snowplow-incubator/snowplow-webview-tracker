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
  trackWebViewEvent,
} from '../src';
import { AtomicProperties } from '../src/api';

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

  it('track a webview event', () => {
    const atomic: AtomicProperties = {
      eventName: 'se',
      trackerVersion: 'webview-0.3.0',
      category: 'cat',
      action: 'act',
    };
    const stringifiedAtomicProperties = JSON.stringify(atomic);

    trackWebViewEvent(atomic, null, null, ['ns1', 'ns2']);

    expect(trackWebViewStub).toHaveBeenCalledWith(
      stringifiedAtomicProperties,
      null,
      null,
      ['ns1', 'ns2']
    );
  });

  // it('adds context entities', () => {
  //   trackStructEvent(
  //     {
  //       category: 'cat',
  //       action: 'act',
  //       context: [
  //         {
  //           schema: 'schema',
  //           data: {
  //             abc: 1,
  //           },
  //         },
  //       ],
  //     },
  //     undefined
  //   );

  //   expect(trackStructEventStub).toHaveBeenCalledWith(
  //     'cat',
  //     'act',
  //     null,
  //     null,
  //     null,
  //     '[{"schema":"schema","data":{"abc":1}}]',
  //     null
  //   );
  // });
});
