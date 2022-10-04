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

/**
 * export interface for any Self-Describing JSON such as context or Self Describing events
 * @typeParam T - The type of the data object within a SelfDescribingJson
 */
export type SelfDescribingJson<
  T extends Record<keyof T, unknown> = Record<string, unknown>
> = {
  /**
   * The schema string
   * @example 'iglu:com.snowplowanalytics.snowplow/web_page/jsonschema/1-0-0'
   */
  schema: string;
  /**
   * The data object which should conform to the supplied schema
   */
  data: T;
};

/**
 * A Self Describing Event
 * A custom event type, allowing for an event to be tracked using your own custom schema
 * and a data object which conforms to the supplied schema
 */
export interface SelfDescribingEvent {
  /** The Self Describing JSON which describes the event */
  event: SelfDescribingJson;
}

/**
 * A Structured Event
 * A classic style of event tracking, allows for easier movement between analytics
 * systems. A loosely typed event, creating a Self Describing event is preferred, but
 * useful for interoperability.
 */
export interface StructuredEvent {
  /** Name you for the group of objects you want to track e.g. "media", "ecomm". */
  category: string;
  /** Defines the type of user interaction for the web object. */
  action: string;
  /** Identifies the specific object being actioned. */
  label?: string;
  /** Describes the object or the action performed on it. */
  property?: string;
  /** Quantifies or further describes the user action. */
  value?: number;
}

/**
 * A Screen View Event
 * Event to track user viewing a screen within a mobile application.
 */
export interface ScreenView {
  /** The name of the screen viewed. */
  name: string;
  /** The id (UUID v4) of screen that was viewed. */
  id: string;
  /** The type of screen that was viewed. */
  type?: string;
  /** The name of the previous screen that was viewed. */
  previousName?: string;
  /** The type of screen that was viewed. */
  previousType?: string;
  /** The id (UUID v4) of the previous screen that was viewed. */
  previousId?: string;
  /** The type of transition that led to the screen being viewed. */
  transitionType?: string;
}

/**
 * A Page View event
 * Used for tracking a page view
 */
export interface PageViewEvent {
  /** Override the page title */
  title?: string | null;
}

interface FullPageViewEvent extends PageViewEvent {
  url?: string;
  referrer?: string;
}

/** Additional data points to set when tracking an event */
export interface CommonEventProperties {
  /** Add context to an event by setting an Array of Self Describing JSON */
  context?: Array<SelfDescribingJson> | null;
}

/** Interface for communicating with the Android mobile tracker */
export type SnowplowWebInterface = {
  trackSelfDescribingEvent: (
    schema: string,
    data: string,
    context: string | null,
    trackers: Array<string> | null
  ) => void;
  trackStructEvent: (
    category: string,
    action: string,
    label: string | null,
    property: string | null,
    value: number | null,
    context: string | null,
    trackers: Array<string> | null
  ) => void;
  trackScreenView: (
    name: string,
    id: string,
    type: string | null,
    previousName: string | null,
    previousId: string | null,
    previousType: string | null,
    transitionType: string | null,
    context: string | null,
    trackers: Array<string> | null
  ) => void;
  trackPageView: (
    pageUrl: string,
    pageTitle: string | null,
    referrer: string | null,
    context: string | null,
    trackers: Array<string> | null
  ) => void;
};

/** Interface for communicating with the iOS mobile tracker */
export type WebkitMessageHandler = {
  postMessage: (message: {
    command: string;
    event:
      | StructuredEvent
      | SelfDescribingJson
      | ScreenView
      | FullPageViewEvent;
    context?: Array<SelfDescribingJson> | null;
    trackers?: Array<string>;
  }) => void;
};

/** Interface for communicating with the React Native tracker */
export type ReactNativeInterface = {
  postMessage: (message: string) => void;
};

declare global {
  interface Window {
    SnowplowWebInterface?: SnowplowWebInterface;
    webkit?: {
      messageHandlers?: {
        snowplow?: WebkitMessageHandler;
      };
    };
    ReactNativeWebView?: ReactNativeInterface;
  }
}
