export default function Dashboard() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">User Profile</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex flex-col items-center">
                        <div className="relative mb-4">
                            <img className="h-24 w-24 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User" />
                            <button className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs rounded-full px-2 py-1">Upload Image</button>
                        </div>
                        <div className="w-full text-sm text-gray-600 space-y-3 mt-4">
                            <div className="flex justify-between"><span>Name:</span> <span className="font-medium text-gray-800">Lawal Wahab Babatunde</span></div>
                            <div className="flex justify-between"><span>Email:</span> <span className="font-medium text-gray-800">wabdotmail@gmail.com</span></div>
                            <div className="flex justify-between"><span>Phone Number:</span> <span className="font-medium text-gray-800">0906 856 2949</span></div>
                            <div className="flex justify-between items-center"><span>Account Status:</span> <span className="font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Active</span></div>
                            <div className="flex justify-between"><span>Referral link:</span> <button className="text-blue-600">Copy</button></div>
                            <a href="#" className="text-blue-600 font-medium">Edit Details</a>
                        </div>
                    </div>
                </div>

                {/* Password/PIN Change */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                    {/* Mock Tabs */}
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <a href="#" className="border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Change Password</a>
                            <a href="#" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Change PIN</a>
                        </nav>
                    </div>

                    <form className="space-y-4">
                        <div>
                            <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">Current Password</label>
                            <input type="password" name="current-password" id="current-password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Enter Current Password" />
                        </div>
                        <div>
                            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">New Password</label>
                            <input type="password" name="new-password" id="new-password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Enter New Password" />
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                            <input type="password" name="confirm-password" id="confirm-password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="Enter New Password" />
                        </div>
                        <button type="submit" className="w-full justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Submit</button>
                    </form>
                </div>
            </div>
        </div>
    );
}