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

import * as Snowplow from './index';

declare global {
  interface Window {
    /// List containing a key (e.g., "snowplow") which is used for the snowplow function on the window object
    GlobalSnowplowNamespace: Array<string>;
    [key: string]: unknown;
  }
}

/*
 * Proxy object
 * This allows the caller to continue push()'ing after the Tracker has been initialized and loaded
 */
export interface Queue {
  /**
   * Allows the caller to push events
   *
   * @param array - parameterArray An array comprising: [ 'functionName', optional_parameters ]
   */
  push: (...args: any[]) => void;
}

/**
 * Executes already called messages (tracked events) and creates a proxy Queue that forwards new messages to the actual APIs
 */
function createQueue(messages: Array<unknown>) {
  const dispatch = (...args: any[]) => {
    for (let i = 0; i < args.length; i += 1) {
      let parameterArray = args[i];
      const method = Array.prototype.shift.call(parameterArray);
      if ((Snowplow as any)[method]) {
        (Snowplow as any)[method].apply(null, parameterArray);
      } else {
        console.error(`Snowplow method "${method}" not found`);
      }
    }
  };

  for (let i = 0; i < messages.length; i++) {
    dispatch(messages[i]);
  }
  return {
    push: dispatch,
  };
}

const functionName = window.GlobalSnowplowNamespace.shift() as string, // most likely "snowplow"
  queue = window[functionName] as { q: Queue | Array<unknown> }; // expects that window.snowplow has an initialized function which adds events to a queue

// replace the pre-initialized queue with a custom one
queue.q = createQueue(queue.q as Array<unknown>);
