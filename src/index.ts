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
  SelfDescribingEvent,
  StructuredEvent,
  PageViewEvent,
  CommonEventProperties,
  SnowplowWebInterface,
  SnowplowWebInterfaceV2,
  WebkitMessageHandler,
  WebkitMessageHandlerV2,
  ScreenView,
  SelfDescribingJson,
  ReactNativeInterface,
  AtomicProperties,
} from './api';

function withAndroidInterface(callback: (_: SnowplowWebInterface) => void) {
  if (window.SnowplowWebInterface) {
    callback(window.SnowplowWebInterface);
  }
}

function withIOSInterface(callback: (_: WebkitMessageHandler) => void) {
  if (
    window.webkit &&
    window.webkit.messageHandlers &&
    window.webkit.messageHandlers.snowplow
  ) {
    callback(window.webkit.messageHandlers.snowplow);
  }
}

function withReactNativeInterface(callback: (_: ReactNativeInterface) => void) {
  if (window.ReactNativeWebView) {
    callback(window.ReactNativeWebView);
  }
}

function withAndroidInterfaceV2(callback: (_: SnowplowWebInterfaceV2) => void) {
  if (window.SnowplowWebInterfaceV2) {
    callback(window.SnowplowWebInterfaceV2);
  }
}

function withIOSInterfaceV2(callback: (_: WebkitMessageHandlerV2) => void) {
  if (
    window.webkit &&
    window.webkit.messageHandlers &&
    window.webkit.messageHandlers.snowplowV2
  ) {
    callback(window.webkit.messageHandlers.snowplowV2);
  }
}

function serializeContext(context?: Array<SelfDescribingJson> | null) {
  if (context) {
    return JSON.stringify(context);
  } else {
    return null;
  }
}

function serializeSelfDescribingEvent(event?: SelfDescribingEvent | null) {
  if (event) {
    return JSON.stringify(event);
  } else {
    return null;
  }
}

/**
 * Track a web event.
 *
 * @param atomicProperties - The atomic properties
 * @param event - Self-describing event information
 * @param entities - Entities to attach to the event
 * @param trackers - The tracker identifiers which the event will be sent to
 */
export function trackWebViewEvent(
  atomicProperties: AtomicProperties,
  event?: SelfDescribingEvent | null,
  entities?: Array<SelfDescribingJson> | null,
  trackers?: Array<string>
) {
  const stringifiedAtomicProperties = JSON.stringify(atomicProperties);
  const stringifiedEvent = serializeSelfDescribingEvent(event);
  const stringifiedEntities = serializeContext(entities);

  withAndroidInterfaceV2((webInterface) => {
    webInterface.trackWebViewEvent(
      stringifiedAtomicProperties,
      stringifiedEvent,
      stringifiedEntities,
      trackers || null
    );
  });

  const getMessage = () => {
    return {
      atomicProperties: stringifiedAtomicProperties,
      selfDescribingEventData: stringifiedEvent,
      entities: stringifiedEntities,
      trackers: trackers,
    };
  };

  withIOSInterfaceV2((messageHandler) => {
    messageHandler.postMessage(getMessage());
  });

  withReactNativeInterface((rnInterface) => {
    rnInterface.postMessage(JSON.stringify(getMessage()));
  });
}

/**
 * Track a self-describing event happening on this page.
 * A custom event type, allowing for an event to be tracked using your own custom schema
 * and a data object which conforms to the supplied schema
 *
 * @param event - The event information
 * @param trackers - The tracker identifiers which the event will be sent to
 */
export function trackSelfDescribingEvent(
  event: SelfDescribingEvent & CommonEventProperties,
  trackers?: Array<string>
) {
  withAndroidInterface((webInterface) => {
    webInterface.trackSelfDescribingEvent(
      event.event.schema,
      JSON.stringify(event.event.data),
      serializeContext(event.context),
      trackers || null
    );
  });

  const getMessage = () => {
    return {
      command: 'trackSelfDescribingEvent',
      event: event.event,
      context: event.context,
      trackers: trackers,
    };
  };

  withIOSInterface((messageHandler) => {
    messageHandler.postMessage(getMessage());
  });

  withReactNativeInterface((rnInterface) => {
    rnInterface.postMessage(JSON.stringify(getMessage()));
  });
}

/**
 * Track a structured event
 * A classic style of event tracking, allows for easier movement between analytics
 * systems. A loosely typed event, creating a Self Describing event is preferred, but
 * useful for interoperability.
 *
 * @param event - The Structured Event properties
 * @param trackers - The tracker identifiers which the event will be sent to
 */
export function trackStructEvent(
  event: StructuredEvent & CommonEventProperties,
  trackers?: Array<string>
) {
  withAndroidInterface((webInterface) => {
    webInterface.trackStructEvent(
      event.category,
      event.action,
      event.label || null,
      event.property || null,
      event.value || null,
      serializeContext(event.context),
      trackers || null
    );
  });

  const getMessage = () => {
    return {
      command: 'trackStructEvent',
      event: {
        category: event.category,
        action: event.action,
        label: event.label,
        property: event.property,
        value: event.value,
      },
      context: event.context,
      trackers: trackers,
    };
  };

  withIOSInterface((messageHandler) => {
    messageHandler.postMessage(getMessage());
  });

  withReactNativeInterface((rnInterface) => {
    rnInterface.postMessage(JSON.stringify(getMessage()));
  });
}

/**
 * Track a visit to a web page
 *
 * @param event - The Page View Event properties
 * @param trackers - The tracker identifiers which the event will be sent to
 */
export function trackPageView(
  event?: PageViewEvent & CommonEventProperties,
  trackers?: Array<string>
) {
  let url = window.location.href;
  let title = event?.title ?? document.title;
  let referrer = document.referrer;

  withAndroidInterface((webInterface) => {
    webInterface.trackPageView(
      url,
      title,
      referrer,
      serializeContext(event?.context),
      trackers || null
    );
  });

  const getMessage = () => {
    return {
      command: 'trackPageView',
      event: {
        url: url,
        title: title,
        referrer: referrer,
      },
      context: event?.context,
      trackers: trackers,
    };
  };

  withIOSInterface((messageHandler) => {
    messageHandler.postMessage(getMessage());
  });

  withReactNativeInterface((rnInterface) => {
    rnInterface.postMessage(JSON.stringify(getMessage()));
  });
}

/**
 * Track a screen view event, which represents user viewing a screen within a mobile application.
 *
 * @param event - The event information
 * @param trackers - The tracker identifiers which the event will be sent to
 */
export function trackScreenView(
  event: ScreenView & CommonEventProperties,
  trackers?: Array<string>
) {
  withAndroidInterface((webInterface) => {
    webInterface.trackScreenView(
      event.name,
      event.id,
      event.type || null,
      event.previousName || null,
      event.previousId || null,
      event.previousType || null,
      event.transitionType || null,
      serializeContext(event.context),
      trackers || null
    );
  });

  const getMessage = () => {
    return {
      command: 'trackScreenView',
      event: {
        name: event.name,
        id: event.id,
        type: event.type,
        previousName: event.previousName,
        previousId: event.previousId,
        previousType: event.previousType,
        transitionType: event.transitionType,
      },
      context: event.context,
      trackers: trackers,
    };
  };

  withIOSInterface((messageHandler) => {
    messageHandler.postMessage(getMessage());
  });

  withReactNativeInterface((rnInterface) => {
    rnInterface.postMessage(JSON.stringify(getMessage()));
  });
}
