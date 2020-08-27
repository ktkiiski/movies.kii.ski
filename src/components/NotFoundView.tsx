import { Typography } from '@material-ui/core';
import { useTitle } from 'broilerkit/react/meta';
import * as React from 'react';
import notFoundImageUrl from '../images/not-found.png';
import styles from './NotFoundView.module.css';
import Root from './layout/Root';

function NotFoundView() {
  useTitle(`Page not found`);
  return (
    <Root>
      <div className={styles.container}>
        <img src={notFoundImageUrl} alt="Page not found" className={styles.image} />
        <Typography className={styles.text}>Page not found</Typography>
      </div>
    </Root>
  );
}

export default NotFoundView;
