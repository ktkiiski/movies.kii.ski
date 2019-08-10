import { Typography } from '@material-ui/core';
import { useOperation } from 'broilerkit/react/api';
import { useRequireAuth, useUserId } from 'broilerkit/react/auth';
import { useTitle } from 'broilerkit/react/meta';
import * as React from 'react';
import * as api from '../api';
import FileUploadButton from './FileUploadButton';
import Layout from './Layout';
import LoadingIndicator from './LoadingIndicator';
import RatingList from './RatingList';

function RatingListView() {
  const userId = useUserId();
  const title = 'My ratings';
  useTitle(title);

  const requireAuth = useRequireAuth();
  const uploadRatings = useOperation(api.uploadUserRatings);

  async function onUpload(files: FileList) {
    const [file] = files;
    if (file) {
      // tslint:disable-next-line:no-console
      console.log(`Uploading file ${file.name}…`, file);
      const auth = await requireAuth();
      const upload = await uploadRatings.post({
        file: files[0],
        profileId: auth.id,
      });
      // tslint:disable-next-line:no-console
      console.log(`Successfully uploaded the ratings:`, upload);
    }
  }

  if (userId === null) {
    // Not logged in
    return <Layout title={title}>
      <Typography>Please sign in to see your ratings.</Typography>
    </Layout>;
  }
  if (!userId) {
    // Logging in...
    return <Layout title={title}><LoadingIndicator /></Layout>;
  }
  return <Layout title={title}>
    <div>
      <FileUploadButton accept='text/csv' onUpload={onUpload}>
        Upload exported IMDb ratings
      </FileUploadButton>
    </div>
    <RatingList userId={userId} />
  </Layout>;
}

export default RatingListView;
