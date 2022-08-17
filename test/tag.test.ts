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

describe('Tag interface', () => {
  it('tracks events through the window.snowplow APIs', () => {
    // initialize the snowplow function with a queue of events – it will be added to window.snowplow
    let snowplow: any = function () {
      (snowplow.q = snowplow.q || []).push(arguments);
    };
    snowplow.q = [];

    // create stubs on the window object
    let trackStructEventStub = jest.fn();
    let trackSelfDescribingStub = jest.fn();
    let windowSpy: any = jest.spyOn(window, 'window', 'get');
    windowSpy.mockImplementation(() => ({
      GlobalSnowplowNamespace: ['snowplow'],
      snowplow: snowplow,
      SnowplowWebInterface: {
        trackStructEvent: trackStructEventStub,
        trackSelfDescribingEvent: trackSelfDescribingStub,
      },
    }));

    // track an event before the tracker tag is loaded
    snowplow('trackStructEvent', { category: 'cat', action: 'act' }, [
      'ns1',
      'ns2',
    ]);

    // load the tracker tag
    require('../src/tag');

    // track an event after the tracker tag is loaded
    snowplow('trackSelfDescribingEvent', {
      event: { schema: 'schema', data: { abc: 1 } },
    });

    // expect both events to have been tracked
    expect(trackStructEventStub).toHaveBeenCalledWith(
      'cat',
      'act',
      undefined,
      undefined,
      undefined,
      undefined,
      ['ns1', 'ns2']
    );
    expect(trackSelfDescribingStub).toHaveBeenCalledWith(
      'schema',
      '{"abc":1}',
      undefined,
      undefined
    );

    windowSpy.mockRestore();
  });
});
