'use client';

import {useEffect} from 'react';
import {createEventId, sendMetaEvent} from '@/lib/meta/client';

export function TrackViewContent({name, value}: {name: string; value: number}) {
  useEffect(() => {
    const eventId = createEventId();

    sendMetaEvent({
      event_name: 'ViewContent',
      event_id: eventId,
      event_source_url: window.location.href,
      value,
      currency: 'DZD',
      content_name: name
    });

    if ((window as any).fbq) {
      (window as any).fbq('track', 'ViewContent', {value, currency: 'DZD'}, {eventID: eventId});
    }
  }, [name, value]);

  return null;
}
