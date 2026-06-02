import Barbearia1 from '../images/Barbearia1.jpg';
import Barbearia2 from '../images/Barbearia2.jpg';
import Barbearia3 from '../images/Barbearia3.webp';
import Barbearia4 from '../images/Barbearia4.jpg';

const imagesById = {
  1: Barbearia1,
  2: Barbearia2,
  3: Barbearia3,
  4: Barbearia4
};

const imagesByName = {
  'Navalha de Ouro - Setor Bueno': Barbearia1,
  'Goiânia Barber Club': Barbearia2,
  'TadeuBRUTAL e Cortes': Barbearia3,
  'Barbearia do Zé - Centro': Barbearia4
};

const isUsableImageUrl = (image) => (
  typeof image === 'string'
  && image.trim() !== ''
  && !image.includes('example.com/')
  && !image.includes('via.placeholder.com/')
);

export const getBarbershopImage = (barbershop = {}) => (
  imagesByName[barbershop.name]
  || imagesById[Number(barbershop.id)]
  || (isUsableImageUrl(barbershop.image) ? barbershop.image : Barbearia1)
);

export const handleBarbershopImageError = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = Barbearia1;
};
