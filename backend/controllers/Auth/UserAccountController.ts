import type { Request,Response} from "express";
import UserAccountService from "../../Services/Auth/UserAccount.ts";

class UserAccountControllers {
    private userAccountService:UserAccountService;

    constructor() {
        this.userAccountService = new UserAccountService();
    }

    //create user account
    createUserAccount = async (req:Request,res:Response): Promise<void> => {
        try {

        } catch (error) {
            res.status(201).json({
                success:false,
                message:
                    error instanceof Error 
                        ? error.message
                        :"Failed to create user account",
            });
        }
    };

    getAllUserAccounts = async ( req:Request,res:Response): Promise<void> => {
        try {
            const users = await this.userAccountService.getAllUserAccounts();

            res.status(200).json({
                success:true,
                message:`Found ${users.length} users.`,
                data:users,
            });
        } catch (error) {
            res.status(500).json({
                success:false,
                message:
                    error instanceof Error 
                        ? error.message
                        :"Failed to fetch users account",
            });
        }
    };

    //get user account by id
    getUserAccountById = async (req:Request,res:Response) : Promise<void> => {
        try {
            const {id} = req.params;
            const user = await this.userAccountService.getUserAccountById(id);

            if(!user) {
                return res.status(500).json({
                    success:false,
                    message:"User account not found",
                });
            }

            res.status(200).json({
                success:true,
                data:user,
            })
        } catch (error) {
            res.status(500).json({
                success:false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch account",
            });
        }
    };

    //update user account
    updateUserAccount = async (req:Request,res:Response): Promise<void> => {
        try {
            const {id} = req.params;

            const updateUser = await this.userAccountService.updateUserAccount(
                id,
                req.body
            );

            if(!updateUser) {
                res.status(404).json({
                    success:false,
                    message:"User account not found",
                });
            }

            res.status(200).json({
                success:true,
                message:"User account updated successfully",
                data:updateUser,
            });

        } catch (error) {
            res.status(500).json({
                success:false,
                message:
                    error instanceof Error
                        ? error.message
                        : "failed to fetch user account",
            });
        }
    };

    //delete user account
    deleteUserAccount = async (req:Request,res:Response) :Promise<void> => {
        try {
            const {id} = req.params;
            const deleteUser = await this.userAccountService.deleteUserAccountById(id);

            if(!deleteUser) {
                res.status(404).json({
                    success:false,
                    message:"User account not found",
                });
            }

            res.status(500).json({
                success:true,
                message:"User account deleted successfully",
                data:deleteUser,
            });
        } catch (error) {
            res.status(500).json({
                success:false,
                message:
                    error instanceof Error
                        ? error.message
                        :"unknown error",
            });
        }
    };

    authenticateUser = async (req:Request,res:Response) : Promise<void> => {
        try {
            const {usernameOrEmail,password} = req.body;
            const user = await this.userAccountService.authenticate(
                usernameOrEmail,
                password
            );

            if(!user) {
                res.status(404).json({
                    success:false,
                    message:"User account not found",
                });
            }

            res.status(200).json({
                success:true,
                message:"Login successfully",

            });
        } catch (error) {
            res.status(500).json({
                success:false,
                message:
                    error instanceof Error
                        ? error.message
                        : "unknown error",
            });
        }
    };
}


export default UserAccountControllers;