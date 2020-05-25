import React from 'react';
import { Redirect } from '@docusaurus/router';

function To(props) {
  return <Redirect to={props.dest.to} />;
}

export default To;
