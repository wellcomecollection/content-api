exports.handler = async (event, context) => {
  console.log('Prismic backup trigger Lambda started', { event, context });

  return {
    items: [
      [{ id_1: 'url_1' }, { id_2: 'url_2' }, { id_3: 'url_3' }],
      [{ id_4: 'url_4' }, { id_5: 'url_5' }, { id_6: 'url_6' }],
      [{ id_7: 'url_7' }, { id_8: 'url_8' }, { id_9: 'url_9' }],
    ],
  };
};
