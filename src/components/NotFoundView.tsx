import { Typography } from '@mui/material';
import useTitle from '../hooks/useTitle';
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
