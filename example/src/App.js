import logo from './logo.svg';
import './App.css';
import {
  trackSelfDescribingEvent,
  trackPageView,
  trackScreenView,
  trackStructEvent,
  trackWebViewEvent,
} from '@snowplow/webview-tracker';
import { v4 as uuidv4 } from 'uuid';

function trackEvents() {
  trackWebViewEvent(
    {
      eventName: 'ue',
      trackerVersion: 'webview',
      useragent: 'useragent',
    },
    {
      schema: 'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
      data: {
        targetUrl: 'http://a-target-url.com',
      },
    },
    [
      {
        schema:
          'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
        data: {
          targetUrl: 'http://in-context.com',
        },
      },
    ],
    ['sp1']
  );

  trackSelfDescribingEvent(
    {
      event: {
        schema:
          'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
        data: {
          targetUrl: 'http://a-target-url.com',
        },
      },
      context: [
        {
          schema:
            'iglu:com.snowplowanalytics.snowplow/link_click/jsonschema/1-0-1',
          data: {
            targetUrl: 'http://in-context.com',
          },
        },
      ],
    },
    ['sp1']
  );

  trackPageView();

  trackStructEvent({
    category: 'cat',
    action: 'act',
    property: 'prop',
    label: 'lbl',
    value: 10,
  });

  trackScreenView({
    name: 'SV1',
    id: uuidv4(),
    type: 'tp',
    previousName: 'prevName',
    previousId: uuidv4(),
    previousType: 'prevType',
    transitionType: 'transType',
  });
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Hello from a Webview!</p>
        <button onClick={trackEvents}>Track events</button>
      </header>
    </div>
  );
}

export default App;
