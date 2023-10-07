const router = require('express').Router();

//importing user model
const User = require('./../models/Users');

//password handler responsible for hashing passwords
const bcrypt = require('bcryptjs');

//sign up
router.post('/signup', (req, res)=>{
    //to read inputs from the body of the request
    let {name, email, dateOfBirth, password, confirmPassword,} = req.body;
    //trim to remove spaces
    name=name.trim();
    email=email.trim().toLowerCase() ;
    password=password.trim();
    confirmPassword=confirmPassword.trim()
    dateOfBirth=dateOfBirth.trim();

    //to ensure none of the fields are empty
    if(!name || !email||!password||!confirmPassword ||!dateOfBirth){
        res.json({
            status: 'FAILED',
            message:'Please fill all required field'
        });
    } //to check if The 'name' contains only letters and spaces.
    else if (!/^[a-zA-Z ]*$/.test(name)){
        res.json({
            status: 'FAILED',
            message:'invalid name entered'
        })
    }// to check if the email is written correctly
    else if(!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
        res.json({
            status: 'FAILED',
            message:'invalid email entered'
        })
    }// to check date too
    else if(!new Date(dateOfBirth).getTime()){
        res.json({
            status: 'FAILED',
            message:'invalid date entered'
        })
    }//check password length
    else if(password.length<8){
        res.json({
            status: 'FAILED',
            message:'password is too short'
        })
        
    }else if(password!==confirmPassword){
        res.json({
            status:"failed",
            message:"passwords do not match"})
    }else{
        //check if user exists
        User.find({email}).then(results=>{
            if(results.length){
                res.json({
                    status:'FAILED',
                    message:"User with provided email already exists"
                })
            }else{
                //if everything goes well then create a new user account in database
                const saltFactor = 10;
                bcrypt.hash(password, saltFactor).then(hashedPassword=>{
                    const newUser = new User({
                        name, email, password:hashedPassword, dateOfBirth
                    });
                    newUser.save().then(results=>{
                        res.json({
                            status:'SUCCESSFUL',
                            message:'Sign up Successful',
                            data: results
                        })
                    }).catch(err=>{
                        console.log("error occured while saving user details ", err);
                        res.json({
                            status:'FAILED',
                            message:'an error occured while saving new user to db'
                        })
                    })
                }).catch(err=>{
                    res.json({
                        status : "Failed",
                        message:"an error ocurred whilst hashing password"
                    })
                })
        
            }
        }).catch(err=>{
            console.log(err);
            res.json({
                status:'FAILED',
                message: "an error ocurred while checking for existing user"
            })
        })
    } 

})



//sign in
router.post('/signin', (req, res)=>{
    //to read inputs from the body of the request
    let {email, password} = req.body;
    //trim to remove spaces
    email=email.trim().toLowerCase() ;
    password=password.trim();

    if(!email||!password){
        res.json({
            status: "FAILED",
            message: "please fill all fields"        
        })
    } else{
        //to check if the user exists
        User.find({email}).then(data =>{
            if(data){
                //user exists
                const hashedPassword =data[0].password;
                bcryptjs.compare(password , hashedPassword ).then((result) => {
                    if(result){
                        res.json({
                            status: "SUCCESSFUL",
                            message: "sign in successful",
                            data: data
                        })
                    }else{
                        res.json({
                            status: "FAILED",
                            message: "invalid password entered",
                        })
                    }
                }).catch(err=>{
                    res.json({
                        status: "FAILED",
                        message: "An error occurred while comparing passwords",
                    });                    
                })
            } else{
                res.json({
                    status:"FAILED",
                    message:'User does not exist'
                })
            }
        }).catch(err=>{
            res.json({
                status:"FAILED",
                message: "An error occurred while finding the user"
            })
        })
    }

})

module.exports = router;