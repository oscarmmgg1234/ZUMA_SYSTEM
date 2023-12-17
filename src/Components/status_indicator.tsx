import React from 'react';

import {http_req} from '../http/req';
import StatusDisplay from './status_display';

const http = http_req();

export default function OnlineStatusIndicator(props: any) {
  const [online, set_online] = React.useState<boolean>(false);

  React.useEffect(() => {
    const updateStatus = () => {
      http.get_api_status(data => {
        set_online(data);
      });
    };

    updateStatus();
    const intervalId = setInterval(updateStatus, 3000);

    return () => clearInterval(intervalId);
  }, []);
  return <StatusDisplay online={online} />;
}
