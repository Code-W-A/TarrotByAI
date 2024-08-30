
export const getRating = (reviews) => {

    let sum = 0;
    let ratingMedia = 0;


    for (let i = 0; i < reviews.length; i++) {
        sum = sum + reviews[i].rating;
      }
    
      ratingMedia = sum / reviews.length;
    
    return ratingMedia
    
    
  
}
