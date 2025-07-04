const Department = require('../Models/Department')
const CatchAsyncErrors = require('../Middlewares/CatchAsyncErrors');
const ErrorHandler = require('../Utilis/ErrorHandler');

// @method : POST
// @route  : /api/v1/Department/createDepartment
exports.createDepartment = CatchAsyncErrors(async (req,res,next)=> {
    //define the request body
    const {name, description} = req.body;
    //check the name field must be filled.
    if(!name)
    {
        return next(new ErrorHandler("Fields are required!",400));
    }
    //check the name donot matches with exisying one
    const existingName = await Department.findOne({name})
    if(existingName)
    {
        return next(new ErrorHandler("Department already exists!",400));
    }
    //Else create new department
    const newDepartment = await Department.create({
        name,
        description,
    })
    res.status(201).json({
        success: true,
        message: "Department Created successfully",
        department: newDepartment,
    })
});

// @method : GET
// @route  : /api/v1/Departments
exports.getAllDepartments = CatchAsyncErrors(async (req, res, next)=> {
    const departments = await Department.find();

    res.status(201).json({
        success: true,
        count: departments.length,
        departments,
    })
});

// @method : GET
// @route  : /api/v1/Departments/:id
exports.getSingleDepartment = CatchAsyncErrors(async (req, res, next)=> {
    const department = await Department.findById(req.params.id);
    if(!department)
    {
        return next(new ErrorHandler(`Department not found with this id: ${req.params.id}`,404))
    }

    res.status(201).json({
        success: true,
        department,
    });
});

// @method : PUT
// @route  : /api/v1/Departments/:id
exports.updateDepartment = CatchAsyncErrors(async (req, res, next)=> {
    const {id} = req.params;
    const {name, description} = req.body;

    let department = await Department.findById(id);
    if(!department)
    {
        return next(new ErrorHandler(`Department not found with this id: ${id}`,404))
    }
    // Handle name change unique constraint: check if new name already exists for another department
    if (name && name !== department.name) {
        const existingDepartmentWithName = await Department.findOne({ name });
        if (existingDepartmentWithName && String(existingDepartmentWithName._id) !== id) {
            return next(new ErrorHandler("A department with this name already exists.", 400));
        }
    }
    //Else update the data
    const updatedData = {name, description};

     department = await Department.findByIdAndUpdate(id, updatedData, {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators on update
        useFindAndModify: false, // Use native MongoDB driver findOneAndUpdate
    });

    res.status(200).json({
        success: true,
        message: "Department updated successfully.",
        department,
    });

});

// @method : DELETE
// @route  : /api/v1/Departments/delete
exports.deleteDepartment = CatchAsyncErrors(async (req, res, next)=> {
    const {id} = req.params;
    const department = await Department.findById(id);
        //check if desired department exists or not.
    if(!department)
    {
        return next(new ErrorHandler(`Department not found with this id: ${id}`,404))
    }
    await department.deleteOne();
    res.status(201).json({
        success: true,
        message: "department Deleted Successfully",
    });
});