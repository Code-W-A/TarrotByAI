// Remap the clinics array to the desired format
export const remappedClinics = (clinics) => {

let newClinics = clinics.map((clinic) =>
 {
    let clinicMainImage;
    for(let i = 0 ; i < clinic.clinicImagesURI.length; i++){
        if(clinic.clinicImagesURI[i].isMainImg){
            clinicMainImage = clinic.clinicImagesURI[i]
        }
    }
    return ({
    aboutClinicData: clinic.aboutClinicData,
    chat: clinic.chat,
    clinicAddress: clinic.clinicAddress,
    clinicAddressArray: clinic.clinicAddressArray,
    clinicAddressLocation: clinic.clinicAddressLocation,
    clinicAppointments: clinic.clinicAppointments,
    clinicAppointmentsUnregistered: clinic.clinicAppointmentsUnregistered,
    clinicCity: clinic.clinicCity,
    clinicDoctors: clinic.clinicDoctors ? clinic.clinicDoctors : [],
    clinicImages: clinic.clinicImages,
    clinicImagesURI: clinic.clinicImagesURI,
    clinicInfoData: clinic.clinicInfoData,
    clinicMainImage: clinicMainImage,
    clinicReviews: clinic.clinicReviews,
    clinicsPatients: clinic.clinicsPatients,
    clinicsPatientsUnregistered: clinic.clinicsPatientsUnregistered,
    contactData: clinic.contactData,
    distanceToPatient: clinic.distanceToPatient,
    email: clinic.email,
    hasProfile: clinic.hasProfile,
    isClinic: clinic.isClinic,
    owner_uid: clinic.owner_uid,
    phoneNumber: clinic.phoneNumber,
    ratingMedia: clinic.ratingMedia,
    termsConditions: clinic.termsConditions,
    updatedAt: clinic.updatedAt,
    numberOfReviews:clinic.numberOfReviews
    
  })});


  return newClinics;
}
  