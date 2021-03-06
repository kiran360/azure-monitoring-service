import { Injectable } from '@angular/core';
import { AppInsights } from 'applicationinsights-js';
import { environment as Environment } from 'environments/environment';

@Injectable()
export class MonitoringService {

  constructor() {
    if (Environment.config && Environment.config.instrumentationKey) {
      AppInsights.downloadAndSetup({ instrumentationKey: Environment.config.instrumentationKey });
        this.setUserContext();
    }
  }

  public initMonitoringService(key: string) {
    AppInsights.downloadAndSetup({ instrumentationKey: key });

  }

  public logEvent(name: string, properties?: { [key: string]: string }, measurements?: { [key: string]: number }) {
    AppInsights.trackEvent(name, this.AddGlobalProperties(properties), measurements);
  }

  public logError(error: Error, properties?: { [key: string]: string }, measurements?: { [key: string]: number }) {
    AppInsights.trackException(error, null, this.AddGlobalProperties(properties), measurements);
  }

  private AddGlobalProperties(properties?: { [key: string]: string }): { [key: string]: string } {
    if (!properties) {
      properties = {};
    }

    return properties;
  }

  public logPageView(name: string, url?: string, properties?: { [key: string]: string }, measurements?: { [key: string]: number }, duration?: number) {
    AppInsights.trackPageView(name, url, this.AddGlobalProperties(properties), measurements, duration);
  }

  public setUserContext() {
    // update anonymous id generated by sdk with authenticated user id as not shown by default in portal yet
    const telemetryInitializer = () => {
      AppInsights.setAuthenticatedUserContext("1", "test@mail.com");
      AppInsights.context.addTelemetryInitializer((envelope) => {
        const tags = envelope.tags;
        if (tags && tags['ai.user.authUserId']) {
          tags['ai.user.id'] = tags['ai.user.authUserId'];
        }
      });
    };

    if (AppInsights.queue !== undefined) {
      AppInsights.queue.push(telemetryInitializer);
    } else {
      telemetryInitializer();
    }
  }
}
