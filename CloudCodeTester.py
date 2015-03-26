import json,httplib
connection = httplib.HTTPSConnection('api.parse.com', 443)
connection.connect()
connection.request('POST', '/1/jobs/updateGodTable', json.dumps({
       "player": "qnweke8s"
     }), {
       "X-Parse-Application-Id": "DtZWNwK4oDNWpZEwvs1no1ZSd2qWArQFrCALane7",
       "X-Parse-REST-API-Key": "ecip3jNNabWD9EWtZGovLoLcrTXSeJHQWW9UpgDd",
       "Content-Type": "application/json"
     })
result = json.loads(connection.getresponse().read())
print result