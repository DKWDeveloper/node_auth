import Person from "../models/userData.js";
import fs from "fs";
import NodeCache from "node-cache";

const nodeCache = new NodeCache();


class UserData {
    /**
     * Function to remove an image file.
     * @param {*} imagePath 
     */
    static removeImage = async (imagePath) => {
        if (imagePath) {
            try {
                const fileSystem = fs.promises;
                await fileSystem.unlink(imagePath);
                // console.log(`Deleted image: ${imagePath}`);
            } catch (error) {
                console.error(`Failed to delete image: ${error}`);
            }
        }
    }

    static areFieldsValid = (body) => {
        console.log(body)
        for (const key in body) {
            if (!body[key]) {
                return false;
            }
        }
        return true;
    }

    /**
     * Define the POST route.
     * @param {*} req 
     * @param {*} res 
     */
    static postUserData = async (req, res) => {
        const image = req.file ? req.file.path : '';
        try {
            const { name, description, age } = req.body;
            const userFormData = JSON.parse(req.body.user);
            console.log('user', userFormData)
            // if(!this.areFieldsValid(userFormData)){
            //     console.log("remove the image")
            //     this.removeImage(image);
            // }
            if (userFormData.name && userFormData.description && image && userFormData.age) {
                if (typeof userFormData.age === "string") {
                    this.removeImage(image);
                    res.status(201).send({ "status": "failed", "message": "age only accept number", "statusCode": 201 });
                } else {
                    const person = new Person({
                        name: userFormData.name,
                        description: userFormData.description,
                        age: userFormData.age,
                        image: image
                    })
                    await person.save();
                    nodeCache.del("person");
                    res.status(201).send({ "status": "success", "message": "done", "statusCode": 201 })
                }
            } else {
                this.removeImage(image);
                res.status(400).send({ "status": "failed", "message": "All Field Required", "statusCode": 400 });
            }
        } catch (err) {
            this.removeImage(image);
            res.status(500).send({ "message": "Internal Server Error"});
        }
    }



    /**
     * Function is Used to UPDATE Api by param.
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    static updateUserById = async (req, res) => {
        const userId = req.params.id; // Assuming the user's ID is provided in the URL parameter
        const { name, description, age } = req.body;
        const image = req.file ? req.file.path : '';
        const userFormData = JSON.parse(req.body.user);
        const person = await Person.findById(userId);

        try {
            if (person) {
                if (userFormData.name && userFormData.description && userFormData.age !== undefined && userFormData.age !== null && image) {
                    const oldImagePath = person.image;
                    console.log(userFormData.age)
                    if (isNaN(userFormData.age) || typeof userFormData.age !== 'number') {
                        this.removeImage(image);
                        res.status(400).json({ "status": "failed", "message": "Age must be a number", "statusCode": 400 });
                    } else {
                        const updatedData = {
                            name: userFormData.name,
                            description: userFormData.description,
                            age: userFormData.age
                        };
                        // Check if there's an image file provided in the request
                        if (req.file) {
                            updatedData.image = req.file.path;
                        }
                        // Use Mongoose to update the user by their ID
                        const updatedUser = await Person.findByIdAndUpdate(userId, updatedData, { new: true });

                        if (req.file) {
                            if (oldImagePath && oldImagePath !== updatedData.image) {
                                this.removeImage(oldImagePath);
                            }
                        }
                        if (!updatedUser) {
                            this.removeImage(image);
                            return res.status(404).json({ "status": "failed", "message": "User not found", "statusCode": 404 });
                        }
                        nodeCache.del("person");
                        res.status(200).json({ "status": "success", "message": "User updated successfully", "user": updatedUser });
                    }
                } else {
                    this.removeImage(image);
                    res.status(400).json({ "status": "failed", "message": "All fields are required", "statusCode": 400 });
                }
            } else {
                this.removeImage(image);
                res.status(400).json({ "status": "failed", "message": "Please Provide Right Id" });
            }
        } catch (err) {
            res.status(500).json({ "status": "error", "message": err.message, "statusCode": 500 });
            this.removeImage(image);
        }
    }

    /**
     * Function is used update By Body Id.
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    static updateUserByBodyId = async (req, res) => {
        const { name, description, age } = req.body;
        const image = req.file ? req.file.path : '';
        const userFormData = JSON.parse(req.body.user);
        const userId = userFormData._id;
        console.log('userId', userId);
        const person = await Person.findById(userId);

        try {
            if (person) {
                if (userFormData.name && userFormData.description && userFormData.age) {
                    const oldImagePath = person.image;
                    if (typeof userFormData.age === "string") {
                        this.removeImage(image);
                        res.status(400).json({ "status": "failed", "message": "Age must be a number", "statusCode": 400 });
                    } else {
                        const updatedData = {
                            name: userFormData.name,
                            description: userFormData.description,
                            age: userFormData.age
                        };
                        // Check if there's an image file provided in the request
                        if (req.file) {
                            updatedData.image = req.file.path;
                        }
                        // Use Mongoose to update the user by their ID
                        const updatedUser = await Person.findByIdAndUpdate(userId, updatedData, { new: true });
                        nodeCache.del("person");
                        if (req.file) {
                            if (oldImagePath && oldImagePath !== updatedData.image) {
                                this.removeImage(oldImagePath);
                            }
                        }
                        if (!updatedUser) {
                            this.removeImage(image);
                            return res.status(404).json({ "status": "failed", "message": "User not found", "statusCode": 404 });
                        }
                        res.status(200).json({ "status": "success", "message": "User updated successfully", "user": updatedUser });
                    }
                } else {
                    this.removeImage(image);
                    res.status(400).json({ "status": "failed", "message": "All fields are required", "statusCode": 400 });
                }
            } else {
                this.removeImage(image);
                res.status(400).json({ "status": "failed", "message": "Please Provide Right Id" });
            }
        } catch (err) {
            res.status(500).json({ "status": "error", "message": err.message, "statusCode": 500 });
            this.removeImage(image);
        }
    }



    /**
     * Define the GET route.
     * @param {*} req 
     * @param {*} res 
     */
    static getUserData = async (req, res) => {
        try {
            let person;
            if (nodeCache.has("person")) {
                person = JSON.parse(nodeCache.get("person"));
                res.status(201).json({ "message": "data get Successfully", "success": true, personList: person });
                console.log('node cache')
            } else {
                person = await Person.find();
                res.status(201).json({ "success": true, personList: person });
                nodeCache.set("person", JSON.stringify(person));
            }

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    /**
     * Define the DELETE by params route.
     * @param {*} req 
     * @param {*} res 
     */
    static deleteUserData = async (req, res) => {
        const { id } = req.params;
        try {
            const user = await Person.findById(id);
            if (user) {
                await Person.findByIdAndDelete(id);
                nodeCache.del("person");
                this.removeImage(user.image);
                res.status(201).send({ "status": "success", "message": "Delete Successfully", "statusCode": 201 });
            } else {
                res.status(201).send({ "status": "failed", "message": "id not found", "statusCode": 201 });
            }
        } catch (error) {
            res.status(500).send({ "status": "failed", "message": "internal Server Error" });
        }
    }

    /**
     * Define DELETE route by body.
     * @param {*} req 
     * @param {*} res 
     */
    static deleteById = async (req, res) => {
        const { id } = req.body;
        try {
            const person = await Person.findById(id);
            console.log(person)
            if (person) {
                await Person.findByIdAndDelete(id);
                nodeCache.del("person");
                this.removeImage(person.image);
                res.status(201).send({ "status": "success", "message": "Delete Successfully", "statusCode": 201 });
            } else {
                res.status(201).send({ "status": "failed", "message": "id not found", "statusCode": 201 });
            }
        } catch (error) {
            res.status(500).send({ "status": "failed", "message": "internal Server Error" });
        }
    }
}
export default UserData;