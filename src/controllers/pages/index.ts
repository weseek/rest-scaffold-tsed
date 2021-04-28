import {
  Constant, Controller, Get, HeaderParams, QueryParams, Req, Res, View,
} from '@tsed/common';
import { Hidden, SwaggerSettings } from '@tsed/swagger';
import { Returns } from '@tsed/schema';

import unirest from 'unirest';
import { SearchResult } from '~/interfaces/searchresult';

@Hidden()
@Controller('/')
export class IndexCtrl {

  @Constant('swagger')
  swagger: SwaggerSettings[];

  @Get('/review')
  @(Returns(200, String).ContentType('text/json'))
  review(@QueryParams('destinationId') specifiedDestinationId: string, @Res() res: Res): void {
    const destinationId = specifiedDestinationId || '1506246';

    const hotelreq = unirest('GET', 'https://hotels4.p.rapidapi.com/properties/list');
    hotelreq.query({
      adalts: '2',
      pageNumber: '1',
      destinationId,
      pageSize: '10',
      // sortOrder: 'PRICE_HIGHEST_FIRST',
      sortOrder: 'PRICE',
      locale: 'en_US',
      currency: 'USD',
    });
    hotelreq.headers({
      'x-rapidapi-key': process.env.X_RAPIDAPI_KEY,
      'x-rapidapi-host': 'hotels4.p.rapidapi.com',
      useQueryString: true,
    });
    hotelreq.end((hotelres) => {
      if (hotelres.error) throw new Error(hotelres.error);
      const results: SearchResult[] = hotelres.body.data.body.searchResults.results.map((result) => {
        console.log(result);
        return {
          price: result.ratePlan.price.exactCurrent,
          thumbnailUrl: result.optimizedThumbUrls.srpDesktop,
        };
      });
      console.log(results);
    });
  }

}
