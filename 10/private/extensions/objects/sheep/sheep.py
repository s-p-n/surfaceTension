import traceback, time, sys, json, numpy as np
from PIL import Image
import cv2
from threading import Thread
from keras.models import Sequential, load_model
from keras.layers import Dense, Dropout, Conv2D, MaxPooling2D, Activation, Flatten
from keras.optimizers import Adam
import tensorflow as tf
ACTION_SPACE_SIZE = 3
ENV_SHAPE = (32, 32, 3)
def createModel():
    model = Sequential()

    model.add(Conv2D(256, (3, 3), input_shape=ENV_SHAPE))  
    model.add(Activation('relu'))
    model.add(MaxPooling2D(pool_size=(2, 2)))
    model.add(Dropout(0.2))

    model.add(Conv2D(256, (3, 3)))
    model.add(Activation('relu'))
    model.add(MaxPooling2D(pool_size=(2, 2)))
    model.add(Dropout(0.2))

    model.add(Flatten())  # this converts our 3D feature maps to 1D feature vectors
    model.add(Dense(64))

    model.add(Dense(ACTION_SPACE_SIZE, activation='linear'))  # ACTION_SPACE_SIZE = how many choices (9)
    model.compile(loss="mse", optimizer=Adam(lr=0.001), metrics=['accuracy'])
    return model

###
# TODO:
# Seperate each sheep into an agent. 
# Need to send the sheep ID to python with the
# environment data. 
# Also need the sheep's doc in general, to act
# on wellness (hunger, hp) and such.

# Sheep need rewards and penalties.
# Maybe something like:
# hp_decreased = -100
# hp_increased = +100
# more_sheep = +50
# less_sheep = -50
##

HP_DECREASE = -100
HP_INCREASE = 100
MORE_SHEEP = 50
LESS_SHEEP = -50



class globalVars():
    pass
G = globalVars()
G.history = np.empty((0,32,32,3))
G.legend = [
    'empty',
    'self',
    'herb',
    'sheep',
    'user',
    'wolf',
    'impassable'
];
G.colors = {
    "empty": (0, 0, 0),
    "self": (0, 200, 200),
    "herb": (0, 255, 0),
    "sheep": (255, 255, 255),
    "user": (255, 255, 0),
    "wolf": (0, 0, 255),
    "impassable": (25, 25, 25)
}
G.env = np.zeros((32, 32, 3), dtype=np.uint8)



def setEnv(input):
    G.env = np.array([[G.colors[G.legend[y]] for y in x] for x in input], dtype=np.uint8)


def paintEnv():
    img = Image.fromarray(G.env, 'RGB')
    img = img.resize((320,320))
    cv2.imshow("sheep", np.array(img))
    cv2.waitKey(10)
"""
ins = np.zeros((32,32), dtype=np.uint8)
ins[25][25] = G.legend.index("self")

ins[16][20] = G.legend.index("herb")
ins[15][21] = G.legend.index("herb")
ins[15][19] = G.legend.index("herb")
ins[17][19] = G.legend.index("herb")


ins[17][24] = G.legend.index("sheep")
ins[14][18] = G.legend.index("sheep")

ins[7][5] = G.legend.index("wolf")

setEnv(ins)

print(G.env.shape)
"""
model = createModel()
agents = {}
#display = Thread(target=paintEnv)
#display.start()


go = True
def out (msg):
    print(msg)
    sys.stdout.flush()

def read_in():
    global go
    i = sys.stdin.readline()[0:-1]
    #print(f'"{i}"')
    if i == "q":
        go = False
        return []
    return json.loads(i)


def main():
    while go:
        #out("Give me an array of numbers like [1,2,3]")
        #try:
            reward = -1
            [env, sheep] = read_in()
            
            setEnv(env)
            i = sheep["_id"]
            if i not in agents:
                agents[i] = {
                    "sheep": sheep,
                    "history": np.array([G.env]),
                    "predictions": None,
                    "rewards": np.array([0])
                }
                
            else:
                agents[i]["history"] = np.append(agents[i]["history"], [G.env], axis=0)

                if sheep["wellness"]["hp"] > agents[i]["sheep"]["wellness"]["hp"]:
                    reward += HP_INCREASE
                elif sheep["wellness"]["hp"] < agents[i]["sheep"]["wellness"]["hp"]:
                    reward += HP_DECREASE

                reward -= sheep["wellness"]["hunger"]

                agents[i]["rewards"] = np.append(agents[i]["rewards"], [reward], axis=0)

            hist = agents[i]["history"]
            rewards = agents[i]["rewards"]
            predictions = agents[i]["predictions"]
            paintEnv()
            
            decision = model.predict(hist[-1:])
            print(decision)
            answer = [float(x) for x in decision[-1]]

            if predictions == None:
                predictions = [decision]
            else:
                predictions = np.append(agents[i]["predictions"], decision, axis=0)
            print(predictions)
            print(rewards*0.01)
            model.fit(hist, predictions)
            #model.train_on_batch(hist[-1:], predictions[-1:], rewards[-1:])
            print(answer)
            out(json.dumps(answer))
            
        #except Exception as e:
        #    print(f'"{e}"')
        #    pass

#start process
if __name__ == '__main__':
    main()
else:
    out("__name__ isnt __main__")
