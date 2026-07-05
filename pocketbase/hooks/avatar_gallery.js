routerAdd(
  'GET',
  '/backend/v1/avatar-gallery',
  (e) => {
    function ppl(gender, seed) {
      return 'https://img.usecurling.com/ppl/medium?gender=' + gender + '&seed=' + seed
    }
    function img(query) {
      return 'https://img.usecurling.com/p/300/300?q=' + encodeURIComponent(query) + '&dpr=2'
    }

    const gallery = {
      anime: [
        { id: 'an1', url: img('abstract painting') },
        { id: 'an2', url: img('colorful artwork') },
        { id: 'an3', url: img('watercolor art') },
        { id: 'an4', url: img('digital illustration') },
        { id: 'an5', url: img('neon art') },
        { id: 'an6', url: img('creative design') },
        { id: 'an7', url: img('modern art') },
        { id: 'an8', url: img('pop art') },
      ],
      profissional: [
        { id: 'pr1', url: ppl('male', 'tb-prof-1') },
        { id: 'pr2', url: ppl('female', 'tb-prof-2') },
        { id: 'pr3', url: ppl('male', 'tb-prof-3') },
        { id: 'pr4', url: ppl('female', 'tb-prof-4') },
        { id: 'pr5', url: ppl('male', 'tb-prof-5') },
        { id: 'pr6', url: ppl('female', 'tb-prof-6') },
        { id: 'pr7', url: ppl('male', 'tb-prof-7') },
        { id: 'pr8', url: ppl('female', 'tb-prof-8') },
      ],
      natureza: [
        { id: 'na1', url: img('mountain landscape') },
        { id: 'na2', url: img('forest trees') },
        { id: 'na3', url: img('ocean waves') },
        { id: 'na4', url: img('sunset sky') },
        { id: 'na5', url: img('green valley') },
        { id: 'na6', url: img('desert dunes') },
        { id: 'na7', url: img('autumn leaves') },
        { id: 'na8', url: img('snow peaks') },
      ],
      minimalista: [
        { id: 'mi1', url: img('geometric pattern') },
        { id: 'mi2', url: img('minimal design') },
        { id: 'mi3', url: img('abstract shapes') },
        { id: 'mi4', url: img('clean lines') },
        { id: 'mi5', url: img('pastel gradient') },
        { id: 'mi6', url: img('simple pattern') },
        { id: 'mi7', url: img('monochrome abstract') },
        { id: 'mi8', url: img('minimal geometry') },
      ],
    }

    return e.json(200, gallery)
  },
  $apis.requireAuth(),
)
