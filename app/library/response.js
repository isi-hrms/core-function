module.exports = {
    error: {
        validator: 'Your input incorrect, please check again.',
        express: 'Sorry, your request not allowed.',
        data_not_found: 'Data not found.',
        cant_access: 'Cannot access for this employee.',
        access_denied: 'please contact your supervisor or hr ',
        data_duplicate: 'Name already exists.',
        permission: 'Access Denied.',
        procedure: 'Database Error',
    },
    success: (action, form) => {
        const msg = {
            store: `Store ${form} Successfully`,
            update: `Update ${form} Successfully`,
            delete: `Delete ${form} Successfully`,
            read: `Get data ${form} Successfully`,
            check: `Api Check ${form} Successfully`,
        };
        let message = null;

        if (form) {
            // jika form is null maka dianggap error

            if (action === 'store') {
                // STORE
                message = msg.store;
            } else if (action === 'update') {
                // UPDATE
                message = msg.update;
            } else if (action === 'delete') {
                // DELETE
                message = msg.delete;
            } else if (action === 'check') {
                // CHECK
                message = msg.check;
            }
             else {
                // READ
                message = msg.read;
            }
        }
        return message;
    },
    build: (error, success, data) => {
        if (error) {
            const dt = {
                header: {
                    message: error,
                    status: 500,
                    access: null,
                },
                data: null,
            };
            return dt;
        } else {
            const dt = {
                header: {
                    message: success,
                    status: 200,
                    access: null,
                },
                data,
            };
            return dt;
        }

    },
};