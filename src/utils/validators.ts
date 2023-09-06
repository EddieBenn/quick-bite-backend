import z from 'zod'

export const zodSchema = z.object({
    email: z.string({
      required_error: "Enter email"
    }),
    phone_no: z.string({
        required_error: "Enter phone - number"
      }),
      name_of_owner:  z.string({
        required_error: "Enter the name of the owner"
      }),
      restaurant_name:  z.string({
        required_error: "Enter restaurant name"
      }),
      address:  z.string({
        required_error: "Enter address"
      }),
      // cover_image:  z.string({
      //   required_error: "Enter image"
      // }),
  });

  export const validateUserSchema = z.object({
    firstname: z.string({required_error: "firstname is required"}),
    lastname: z.string({required_error: "lastname is required"}),
    email:z.string({required_error: "email is required"}).email({message:'mail is invalid'}),
    password:z.string({required_error: "password is required"}).min(6),
    phone_no:z.string({required_error: "phone number is required"}).min(11),
    address:z.string({required_error: "address is required"})
})

export const validateFoodSchema = z.object({
  name: z.string({required_error: "food name is required"}),
  price: z.string({required_error: "food price is required"}),
  // food_image: z.string({required_error: "food image is required"}),
  ready_time: z.string({required_error: "ready time is required"}),
  description: z.string({required_error: "food description is required"}),
})

export const vendorLoginSchema = z.object({
  email:z.string({required_error:"email is required"}).email({message:"invalid email"}),
  password:z.string({required_error:"password is required"})
})