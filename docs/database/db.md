# **Database**

## **Purposes**:

- [User](#user):

  - Store valid user information (Uname, PW....)
  - Keep data current and safe
  - User data can be stored in a simple SQL/NoSQL DB

- [Stream](#stream):

  - Must provide valid information about all stream types
  - DateBeg, DateEnd, StreamID, UserID
  - Must define value type
    - Each seperate "frame" of the stream must have a valid [header](#dataHeader)

- Store current state of [nerual network](#neural-network)
- Provide a constant relation between NN instances (NXT) and owner users
  - Each user must have their own neural network resources on the server
- Keep valid logs for each event (recieve, do...)

# **User**:

## **NoSQL** model:

```JSON
{
  "user": {
      "unique_id": "<user unique_id>",
      "role": "<user role>",
      "username": "<your username>",
      "password": "<your password>",
      "email": "<your email>",
      "nxt_api_key": "<your NXT API key>"
  }
}

```

## **SQL/OO**:

| **unique_id** | username | password | email | nxt_api_key |
| ------------- | -------- | -------- | ----- | ----------- |

# **Stream**:

- Types:

  - **GPS** (LocationStream) - Stream that provides constant location of the NXT robot
  - **CameraFeed** (VisionStream) - Stream that provides constant vision feed of the NXT robot

- Basic information:

  - **streamID**: str
  - **ownerID**: str (userID)
  - **begTime**: datetime
  - **endTime**: datetime
  - **type**: enum (LocationStream/VisionStream)
  - **size**: float - Expected size of the stream (kb/mb) (~)

## **LocationStream** information:

- **streamID**: str - Unique Stream ID
- **ownerID**: str - Owner that should be able to follow the stream
- **begTime**: datetime - Starting time of the stream
- **endTime**: datetime - Ending time of the stream
- **Location**: - Basic location information of the stream
  - startingX: int
  - startingY: int
  - startingZ: int = None
  - endX: int
  - endY: int
  - endZ: int = None

## **LocationStream** json structure:

```JSON
{
  "locationStream": {
    "streamID": "<stream_id>",
    "streamName": "<stream_name>",
    "streamOwner": "<stream_owner/userID>",
    "beginTime": "<begin_time>",
    "endTime": "<end_time>",
    "location": {
      "startingX": 0,
      "startingY": 0,
      "endingX": 0,
      "endingY": 0,
      "accuracy": 0
    }
  }
}
```

## **VisionStream** information:

- Vision stream data should be sent in fixed (predetermined) intervals
- Structure:

  - **streamID**
  - **ownerID**
  - **begTime**
  - **endTime**
  - **format** (Video/Photo)
  - **quality**

## **StreamData** (frame):

- Each frame, coordinate or photo should have its own value to be decompiled later
- Data frame should not have any more information than necessary
- Frame should be attached as a part of a countinous stream of data
- **Location**:
  - Location should be composed of X, Y coordinates (pref. matrix of floating points)
- **Video/Photo**:
  - Each photo should be of fixed size and codec

# **Neural Network**: (Low priority)

- Base information:

  - NNID
  - State
  - CurrentSynapseMatrix
  - InputNum
  - OutputNum
  - LayerNum
  - NodesNum
  - LearningRate

- Node information:
  - NodeID
  - NodeType (in,mid,out)
  - ActivationFunType
  - LayerNum
