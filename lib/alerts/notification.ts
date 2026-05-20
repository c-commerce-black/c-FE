import type { AlertItem, AlertsData } from "./types";

const URGENT_ALERT_SECONDS = 60 * 60 * 24;

function getAlertIdentity(item: AlertItem) {
  return item.alertId ?? item.product.id;
}

function getAlertSignal(item: AlertItem) {
  const identity = getAlertIdentity(item);
  if (!identity) {
    return null;
  }

  return item.notifiedAt ? `${identity}:${item.notifiedAt}` : identity;
}

function isNotificationCandidate(item: AlertItem) {
  if (item.isRead === false || item.isTriggered) {
    return true;
  }

  return (
    item.isOn &&
    item.product.remainSeconds > 0 &&
    item.product.remainSeconds <= URGENT_ALERT_SECONDS
  );
}

export function createAlertSignalKey(data: AlertsData | undefined) {
  if (!data) {
    return null;
  }

  const signals = data.wishAlerts
    .filter(isNotificationCandidate)
    .map(getAlertSignal)
    .filter((signal): signal is string => Boolean(signal));

  if (data.unreadCount > 0) {
    signals.push(`count:${data.unreadCount}`);
  }

  if (!signals.length) {
    return null;
  }

  return [...new Set(signals)].sort().join("|");
}
