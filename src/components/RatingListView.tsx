/* eslint-disable react/jsx-no-bind */
import { Typography } from '@material-ui/core';
import { useOperation } from 'broilerkit/react/api';
import { useUserId } from 'broilerkit/react/auth';
import { useUpload } from 'broilerkit/react/client';
import { useTitle } from 'broilerkit/react/meta';
import * as React from 'react';
import * as api from '../api';
import FileUploadButton from './FileUploadButton';
import Layout from './Layout';
import LoadingIndicator from './LoadingIndicator';
import RatingList from './RatingList';
import { useRequireAuth } from './SignInDialogProvider';

function RatingListView() {
  const userId = useUserId();
  const title = 'My ratings';
  useTitle(title);

  const requireAuth = useRequireAuth();
  const createRatingUpload = useOperation(api.createRatingUpload);
  const uploadRatings = useUpload();

  async function onUpload(files: FileList) {
    const [file] = files;
    if (file) {
      // eslint-disable-next-line no-console
      console.log(`Uploading file ${file.name}…`, file);
      const auth = await requireAuth();
      // Get the upload form fields
      const { form } = await createRatingUpload.post({ profileId: auth.id });
      // Upload the file
      const result = await uploadRatings(file, form);
      // eslint-disable-next-line no-console
      console.log(`Successfully uploaded the ratings:`, result);
    }
  }

  if (userId === null) {
    // Not logged in
    return (
      <Layout title={title}>
        <Typography>Please sign in to see your ratings.</Typography>
      </Layout>
    );
  }
  if (!userId) {
    // Logging in...
    return (
      <Layout title={title}>
        <LoadingIndicator />
      </Layout>
    );
  }
  return (
    <Layout title={title}>
      <div>
        <FileUploadButton accept="text/csv" onUpload={onUpload}>
          Upload exported IMDb ratings
        </FileUploadButton>
      </div>
      <RatingList userId={userId} />
    </Layout>
  );
}

export default RatingListView;
