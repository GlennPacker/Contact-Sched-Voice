import React from 'react';
import Addresses from '../../components/Address/Addresses';

export default function AddressListPage() {
  return (
    <>
      <h1>Addresses</h1>
      <Addresses />
    </>
  );
}

// Disable static generation for this page since it requires client-side data
export async function getServerSideProps() {
  return { props: {} };
}
