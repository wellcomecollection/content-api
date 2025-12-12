exports.handler = async (event, context) => {
  console.log('Prismic backup download Lambda started');
  console.log('Assets to download', JSON.stringify(event.items, null, 2));
  return;
};
