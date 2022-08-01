import {Response} from '@loopback/rest'

export const handleSuccess = (response: Response, data: any) => {
  return response.status(200).json(data);
}
