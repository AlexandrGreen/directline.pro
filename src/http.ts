import axios, {AxiosInstance} from 'axios'

const api: AxiosInstance = axios.create({
	baseURL: 'https://lobster.tools/api/v1',
	headers: {
		'Authorization': 'Bearer BT3HK2NpCnyrKiDo',
		'Content-Type': 'multipart/form-data',
	},
});

export default api;
