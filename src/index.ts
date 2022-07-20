import {
  SelfDescribingEvent,
  StructuredEvent,
  PageViewEvent,
  CommonEventProperties,
  SnowplowWebInterface,
  WebkitMessageHandler,
  ScreenView,
  SelfDescribingJson,
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

function serializeContext(context?: Array<SelfDescribingJson> | null) {
  if (context) {
    return JSON.stringify(context);
  } else {
    return undefined;
  }
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
  withAndroidInterface(webInterface => {
    webInterface.trackSelfDescribingEvent(
      event.event.schema,
      JSON.stringify(event.event.data),
      serializeContext(event.context),
      trackers
    );
  });

  withIOSInterface(messageHandler => {
    messageHandler.postMessage({
      command: 'trackSelfDescribingEvent',
      event: event.event,
      context: event.context,
      trackers: trackers,
    });
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
  withAndroidInterface(webInterface => {
    webInterface.trackStructEvent(
      event.category,
      event.action,
      event.label,
      event.property,
      event.value,
      serializeContext(event.context),
      trackers
    );
  });

  withIOSInterface(messageHandler => {
    messageHandler.postMessage({
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
    });
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

  withAndroidInterface(webInterface => {
    webInterface.trackPageView(
      url,
      title,
      referrer,
      serializeContext(event?.context),
      trackers
    );
  });

  withIOSInterface(messageHandler => {
    messageHandler.postMessage({
      command: 'trackPageView',
      event: {
        url: url,
        title: title,
        referrer: referrer,
      },
      context: event?.context,
      trackers: trackers,
    });
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
  withAndroidInterface(webInterface => {
    webInterface.trackScreenView(
      event.name,
      event.id,
      event.type,
      event.previousName,
      event.previousId,
      event.previousType,
      event.transitionType,
      serializeContext(event.context),
      trackers
    );
  });

  withIOSInterface(messageHandler => {
    messageHandler.postMessage({
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
    });
  });
}
